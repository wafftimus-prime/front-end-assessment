export interface EmployeeData {
  // Stored Attributes
  id: number;
  employee_name: string;
  employee_salary: number;
  employee_age: number;

  // UI Attributes Only
  initials?: string;
  [key: string]: any;
}

export interface BaseObjectModel {
  label?: string;
  value?: string;
  type?: string;
  attr?: string;

  [key: string]: any;
}
