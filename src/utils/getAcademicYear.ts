const getAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const nextYear = year + 1;
  return `${year}-${nextYear}`;
};

export default getAcademicYear;
