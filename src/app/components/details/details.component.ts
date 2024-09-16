import { CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EmployeesService } from '../../data';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  standalone: true,
  imports: [
    RouterModule,
    MatButtonModule,
    MatIconModule,
    CurrencyPipe
  ],
})
export class DetailsComponent implements OnInit {
  es = inject(EmployeesService)
  private _cdr = inject(ChangeDetectorRef)

  constructor(
    private route: ActivatedRoute,
  ) {
  }

  async ngOnInit() {
    // Load employees if not loaded already,
    if (!this.es.loaded) await this.es.getEmployees();

    // Fetch Id number from route
    const id = Number(this.route.snapshot.paramMap.get('id'))

    // Select employee in service if not already selected
    if (typeof this.es.selected_employee !== 'number') this.es.selectEmployee(id)

    console.log(this.es.employee)

    this._cdr.markForCheck()
  }

}
