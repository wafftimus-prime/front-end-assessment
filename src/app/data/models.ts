export interface EmployeeData {
  id: number;
  employee_name: string;
  employee_salary: number;
  employee_age: number;

  initials?: string;
  [key: string]: any;
}

export interface SortAttribute {
  name: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean'
}

export interface FilterAttribute {
  label: string;
  name: string;
  type: 'string' | 'number' | 'number-range' | 'date' | 'date-range' | 'boolean' | 'select' | 'multi-select';
  default?: any;
  options?: (string | { label: string, value: string })[]; // For select and multi-select types
  range_options?: {
    min?: number;
    max?: number;
    step?: number;
  }
}
