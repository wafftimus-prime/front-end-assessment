import { CommonModule, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { EmployeeData, EmployeesService, ignoreClick, RemoveUnderScorePipe, sortArray } from '../../data';
import { FilterMenuComponent } from '../filter-menu/filter-menu.component';
import { SortMenuComponent } from '../sort-menu/sort-menu.component';
import { VowelSearchComponent } from '../vowel-search/vowel-search.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    RouterModule,
    MatMenuModule,
    MatButtonModule,
    MatExpansionModule,
    MatTooltipModule,

    TitleCasePipe,
    RemoveUnderScorePipe,
    FilterMenuComponent,
    SortMenuComponent,
    VowelSearchComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit, OnDestroy {
  es: EmployeesService = inject(EmployeesService)

  list!: EmployeeData[];

  active_header!: { label: string, type: string, attr: string };
  attributes: { label: string, type: string, attr: string }[] = [
    { attr: 'id', label: 'ID', type: 'number' },
    { attr: 'employee_name', label: 'Name', type: 'string' },
    { attr: 'employee_salary', label: 'Salary', type: 'number' },
    { attr: 'employee_age', label: 'Age', type: 'number' },
  ];

  filter_value!: any
  sort_value!: { attribute: string, type: string, direction: string }
  sort_form: FormGroup = new FormGroup({
    attribute: new FormControl(null),
    type: new FormControl(null),
    direction: new FormControl(null),
  });

  ignoreClick = ignoreClick;
  keys = Object.keys

  comparisons: { label: string, value: any }[] = [
    { label: "Greater than", value: 'greater-than' },
    { label: "Less than", value: 'less-than' },
    { label: "Equal", value: 'equal' },
    { label: "Between", value: 'between' },
  ]

  private _cdr: ChangeDetectorRef = inject(ChangeDetectorRef)
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // -------------------
  // VALUE ACCESSORS
  // -------------------

  get hasFiltersInPlace(): boolean {
    if (this.filter_value) return !Object.values(this.filter_value).every((v: any) => !!!v.value)
    else return false
  }

  // -------------------
  // LIFE-CYCLE HOOKS
  // -------------------

  async ngOnInit() {
    await this.initData()
  }

  /**
   * On destroy
  */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // -------------------
  // PUBLIC METHODS
  // -------------------

  async initData() {
    if (!this.es.loaded) await this.es.getEmployees()

    this.filter_value = null;

    this.list = this.es.employees();

    this._cdr.markForCheck();
  }

  catchSearch(event: any) {
    this.filter_value = event
    console.log(event)
    let list = [...this.es.employees()]

    Object.keys(event).forEach(k => {

      switch (event[k].type) {
        case 'number':
          list = list.filter(i => {
            switch (event[k].comparison) {
              case 'greater-than':
                if (event[k].value !== null) return i[k] > Number(event[k].value)
                else return i[k]
              case 'less-than':
                if (event[k].value !== null) return i[k] < Number(event[k].value)
                else return i[k]
              case 'equal':
                if (event[k].value !== null) return i[k] === Number(event[k].value)
                else return i[k]
              case 'between':
                if (event[k].value !== null && event[k].value_2 !== null)
                  return i[k] >= Number(event[k].value) && i[k] <= Number(event[k].value_2)
                else return i[k]
              default: return i
            }
          })
          break;
        case 'string':
          list = list.filter(i => {
            if (event[k].value)
              return (i[k])?.toLocaleLowerCase()?.includes(event[k].value.toLocaleLowerCase())
            else return i
          })
          break;

        default:
          break;
      }
    })

    this.list = list
    this.catchSort(this.sort_value, this.list)
    this._cdr.markForCheck()
  }

  catchSort(sort: any, list?: EmployeeData[]) {
    this.sort_value = sort
    if (sort?.attribute && sort?.type) {
      this.list = sortArray(this.list, sort.attribute, sort.type, sort.direction)
    }
    else this.list = list || this.es.employees()
    this._cdr.markForCheck()
  }

}
