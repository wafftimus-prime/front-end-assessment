import { Injectable, signal, Signal } from '@angular/core';

import { DATA } from './constants';
import { EmployeeData } from './models';

@Injectable({ providedIn: 'root' })
export class EmployeesService {
  selected_employee!: number
  loaded = false
  employees!: Signal<Array<EmployeeData>>


  constructor(
  ) {
  }

  get employee(): EmployeeData {
    let _employee = this.employees().find(e => e.id === this.selected_employee) as EmployeeData
    _employee.initials = _employee.employee_name?.split(" ").reduce((acc, v) => acc + v[0], "")
    return _employee
  }

  async getEmployees() {
    return new Promise((resolve, reject) => {
      // Simulate an asynchronous operation using setTimeout
      if (!this.loaded) {
        setTimeout(() => {
          this.employees = signal(DATA)
          this.loaded = true
          resolve(this.employees()); // Resolve the promise with the data
        }, 500)
      }
    });
  }

  selectEmployee(id: number) {
    this.selected_employee = id;
  }

}
