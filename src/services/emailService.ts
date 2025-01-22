import { createTransport } from "nodemailer";

const transporter = createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "mariana.shanahan98@ethereal.email",
    pass: "h16eBPqvvgke8SV1tt",
  },
});

export async function main() {
  try {
    const info = await transporter.sendMail({
      from: '"Maddison Foo Koch 👻" <mariana.shanahan98@ethereal.email>', // sender address
      to: "bar@example.com, baz@example.com", // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>", // html body
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error", error.message);
  }
}
