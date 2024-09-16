import { Injectable, signal, WritableSignal } from '@angular/core';

import { DATA } from './constants';
import { EmployeeData } from './models';

@Injectable({ providedIn: 'root' })
export class EmployeesService {
  loaded: WritableSignal<boolean> = signal(false);
  selected_employee: WritableSignal<number | null> = signal(null);
  employees!: WritableSignal<Array<EmployeeData>>;

  /** Returns the employee data of the employee whose `id` attribute is equal to `this.selected_employee()` */
  get employee(): EmployeeData {
    let _employee = this.employees().find(e => e.id === this.selected_employee()) as EmployeeData;
    _employee.initials = _employee.employee_name?.split(" ").reduce((acc, v) => acc + v[0], "");
    return _employee
  }

  /** If employees are not loaded, then loads employees from constant into signal */
  async getEmployees() {
    return new Promise((resolve, reject) => {
      // Simulate an asynchronous operation using setTimeout
      if (!this.loaded()) {
        setTimeout(() => {
          this.employees = signal(DATA);
          this.loaded.set(true);
          resolve(this.employees()); // Resolve the promise with the data
        }, 500)
      }
    });
  }

  /** Change the employee selected in this service */
  selectEmployee = (id: number | null) => this.selected_employee.set(id);

}
