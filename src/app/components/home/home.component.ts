import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { EmployeeData, EmployeesService, ignoreClick, sortArray } from '../../data';
import { VowelSearchComponent } from '../vowel-search/vowel-search.component';
import { SortMenuComponent } from '../sort-menu/sort-menu.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatIconModule,
    MatSortModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatMenuModule,
    MatButtonModule,
    MatChipsModule,
    MatExpansionModule,
    MatTooltipModule,



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

  sort_value!: { attribute: string, type: string, direction: string }
  sort_form: FormGroup = new FormGroup({
    attribute: new FormControl(null),
    type: new FormControl(null),
    direction: new FormControl(null),
  });

  filter_form!: FormGroup;
  ignoreClick = ignoreClick;

  comparisons: { label: string, value: any }[] = [
    { label: "Greater than", value: 'greater-than' },
    { label: "Less than", value: 'less-than' },
    { label: "Equal", value: 'equal' },
    { label: "Between", value: 'between' },
  ]

  private _cdr: ChangeDetectorRef = inject(ChangeDetectorRef)
  private _fb: FormBuilder = inject(FormBuilder)
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // -------------------
  // LIFE-CYCLE HOOKS
  // -------------------

  async ngOnInit() {
    await this.initData()

    // Subscribe to value changes in order to handle sorting the current header
    this.initSortSub()

    // Subscribe to value changes in order to handle filtering the list
    this.initFilterForm();
    this.initFilterSub();
  }

  /**
   * On destroy
  */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  async initData() {
    if (!this.es.loaded) await this.es.getEmployees()

    this.list = this.es.employees();

    this._cdr.markForCheck();
  }

  initSortSub() {
  }

  initFilterSub() {
    this.filter_form.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(value => {
        this.catchSearch(value)
      })

  }

  initFilterForm() {
    this.filter_form = this._fb.group({})

    // Use attributes in order to dynamically init the filter form
    this.attributes.forEach(a => {

      const form: FormGroup = this._fb.group({
        value: null,
        type: a.type
      })
      if (a.type === 'number') {
        form.addControl('comparison', this._fb.control(null))
        form.addControl('value_2', this._fb.control(null));

        // Make sure that the first value is always less than the second value
        form.get('value')?.valueChanges.subscribe(value => {
          const _vaule = Number(value)

          if (_vaule >= Number(form.get('value_2')?.value)) {
            form.get('value_2')?.setValue(Number(_vaule) + 1, { emitEvent: false });
          }
          else if (_vaule < 0) form.get('value')?.setValue(0, { emitEvent: false });
          form.get('value_2')?.updateValueAndValidity({ emitEvent: false });
        });

        // Make sure that the second value is always greater than the first value
        form.get('value_2')?.valueChanges.subscribe(value => {
          const _vaule = Number(value)
          if (_vaule <= Number(form.get('value')?.value)) {
            if (Number(_vaule) - 1 > 0) form.get('value')?.setValue(Number(_vaule) - 1, { emitEvent: false });
          }
          form.get('value')?.updateValueAndValidity({ emitEvent: false });
        });



      }

      this.filter_form.addControl(a.attr, form);
    });
  }

  formFilterValueControl(attribute: string): FormControl {
    return this.filter_form.get([attribute, 'value']) as FormControl
  }

  formFilterValue2Control(attribute: string): FormControl {
    return this.filter_form.get([attribute, 'value_2']) as FormControl
  }

  formFilterComparisonControl(attribute: string): FormControl {
    return this.filter_form.get([attribute, 'comparison']) as FormControl
  }

  toggleFilterFormComparison(attribute: string, value: string) {
    this.formFilterComparisonControl(attribute).setValue(value)
    this.filter_form.get(attribute)?.markAsDirty()
  }

  resetFilterControl = (attribute: string) => this.filter_form.get([attribute])?.reset();

  catchSearch(event: any, skip_update?: boolean) {
    let list = [...this.es.employees()]

    Object.keys(event).forEach(k => {

      switch (event[k].type) {
        case 'number':
          list = list.filter(i => {
            switch (event[k].comparison) {
              case 'greater-than':
                return i[k] > Number(event[k].value)
              case 'less-than':
                return i[k] < Number(event[k].value)
              case 'equal':
                return i[k] === Number(event[k].value)
              case 'between':
                return i[k] > Number(event[k].value) && i[k] > Number(event[k].value_2)
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
    console.log(sort)
    this.sort_value = sort
    if (sort.attribute && sort.type) {
      this.list = sortArray(this.list, sort.attribute, sort.type, sort.direction)
    }
    else this.list = list || this.es.employees()
  }

}
