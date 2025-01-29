import { leaveRequestsTable, userLeavesTable, usersTable } from "../db/schema";
import { Request, Response } from "express";
import { db } from "../db/index";
import { hash } from "bcrypt";
import { and, eq, inArray } from "drizzle-orm";
import {
  leaveRequestSchema,
  updateUserSchema,
  userSchema,
} from "../validations/validation";
import { main } from "../services/emailService";
import getAcademicYear from "../utils/getAcademicYear";
import { DepartmentType, VALID_DEPARTMENTS } from "../types/types";
export const studentRegister = async (req: Request, res: Response) => {
  try {
    const userData = userSchema.parse(req.body);
    const hashPass = await hash(userData.password, 10);
    await db.transaction(async (tx) => {
      const [newUser] = await tx
        .insert(usersTable)
        .values({ ...userData, password: hashPass, roleId: 4 })
        .returning({ id: usersTable.id });

      if (!newUser) throw new Error("User creation failed");
      await tx
        .insert(userLeavesTable)
        .values({ userId: newUser.id, academicYear: getAcademicYear() });
    });
    res.status(201).json({ message: "Student registered successfully" });
  } catch (error) {
    console.error("Error Registering Student:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = res.locals.userData;
    const updatedData = updateUserSchema.parse(req.body);
    const data = await db
      .update(usersTable)
      .set({ ...updatedData })
      .where(eq(usersTable.id, id))
      .returning({
        name: usersTable.name,
        department: usersTable.department,
        email: usersTable.email,
        phone: usersTable.phone,
      });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error while profile update:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const applyLeave = async (req: Request, res: Response) => {
  try {
    const studentLeave: typeof leaveRequestsTable.$inferInsert =
      leaveRequestSchema.parse(req.body);
    const { id } = res.locals.userData;
    const { requestToId } = studentLeave;
    if (!id) {
      res.status(401).json({ error: "Unauthorized request" });
    }
    const approver = (
      await db
        .select({ roleId: usersTable.roleId })
        .from(usersTable)
        .where(eq(usersTable.id, requestToId!))
        .limit(1)
    ).at(0);
    if (approver?.roleId === 4) {
      res.status(403).json({ message: "Invalid Request" });
    }
    await db.insert(leaveRequestsTable).values({ ...studentLeave, userId: id });
    main();
    res.status(200).json({ message: `Leave Applied` });
  } catch (error) {
    console.error("Error while requesting Leave:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getLeavesByDepartment = async (req: Request, res: Response) => {
  try {
    const { department } = req.params;
    const departmentEnum = department as DepartmentType;
    if (!VALID_DEPARTMENTS.includes(departmentEnum)) {
      res.status(400).json({ message: "Invalid department" });
      return;
    }
    const leaveRequests = await db
      .select({
        studentName: usersTable.name,
        startDate: leaveRequestsTable.startDate,
        endDate: leaveRequestsTable.endDate,
      })
      .from(leaveRequestsTable)
      .innerJoin(usersTable, eq(leaveRequestsTable.userId, usersTable.id))
      .where(
        and(
          eq(usersTable.roleId, 4),
          eq(usersTable.department, departmentEnum),
          eq(leaveRequestsTable.status, "approved")
        )
      );

    res.status(200).json({ leaves: leaveRequests });
  } catch (error) {
    console.error("Error fetching leave data:", error.message);
    res.status(500).json({
      message: "Failed to retrieve leave data. Please try again later.",
    });
  }
};
export const getPersonalLeaveRequests = async (req: Request, res: Response) => {
  try {
    const { id } = res.locals.userData;
    if (!id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const leaves = await db
      .select({
        leaveType: leaveRequestsTable.leaveType,
        from: leaveRequestsTable.startDate,
        to: leaveRequestsTable.endDate,
        reason: leaveRequestsTable.reason,
        approvedBy: usersTable.name,
        status: leaveRequestsTable.status,
      })
      .from(leaveRequestsTable)
      .leftJoin(usersTable, eq(leaveRequestsTable.approvedBy, usersTable.id)) // Left join to get approver's name
      .where(eq(leaveRequestsTable.userId, id));
    res.status(200).json({ leaves });
  } catch (error) {
    console.error("Error fetching leave data:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching leave data" });
  }
};
export const getLeaveBalance = async (req: Request, res: Response) => {
  try {
    const { id } = res.locals.userData;
    const [userLeave] = await db
      .select({
        totalLeave: userLeavesTable.totalLeave,
        availableLeave: userLeavesTable.availableLeave,
        usedLeave: userLeavesTable.usedLeave,
        attendance: userLeavesTable.attendancePercentage,
      })
      .from(userLeavesTable)
      .leftJoin(usersTable, eq(usersTable.id, userLeavesTable.userId)) // Using leftJoin
      .where(eq(usersTable.id, id));
    res.status(200).json(userLeave);
  } catch (error) {
    console.error("Error fetching leave data:", error);
    res.status(500).json({ message: "An error occurred while fetching  data" });
  }
};
export const getTeacherForLeave = async (req: Request, res: Response) => {
  try {
    const { department } = req.params;
    const departmentEnum = department as DepartmentType;
    if (!VALID_DEPARTMENTS.includes(departmentEnum)) {
      res.status(400).json({ message: "Invalid department" });
      return;
    }
    const teachers = await db
      .select({ id: usersTable.id, name: usersTable.name })
      .from(usersTable)
      .where(
        and(
          eq(usersTable.department, departmentEnum),
          inArray(usersTable.roleId, [2, 3])
        )
      );
    res.status(200).json(teachers);
  } catch (error) {
    console.error("Error while fetching teachers", error);
    res.status(500).json({ message: "Error occured while fetching data" });
  }
};
