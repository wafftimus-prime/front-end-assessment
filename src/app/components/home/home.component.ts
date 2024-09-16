import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, Signal, signal } from '@angular/core';
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
import { debounceTime, filter, map, Subject, takeUntil } from 'rxjs';
import { checkForVowel, EmployeeData, EmployeesService, ignoreClick, sortArray } from '../../data';

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
    MatTooltipModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit, OnDestroy {
  loading = signal(false)
  es: EmployeesService = inject(EmployeesService)
  vowel_control: FormControl = new FormControl<string>("")

  response!: string | null
  valid_response!: boolean

  list!: EmployeeData[];

  active_header!: any;
  attributes: { label: string, type: string, attr: string }[] = [
    { attr: 'id', label: 'ID', type: 'number' },
    { attr: 'employee_name', label: 'Name', type: 'string' },
    { attr: 'employee_salary', label: 'Salary', type: 'number' },
    { attr: 'employee_age', label: 'Age', type: 'number' },
  ];

  filter_form!: FormGroup;
  sort_form: FormGroup = new FormGroup({
    attribute: new FormControl(null),
    type: new FormControl(null),
    direction: new FormControl(null),
  });

  ignoreClick = ignoreClick;

  comparisons: { label: string, value: any }[] = [
    { label: "Greater than", value: 'greater-than' },
    { label: "Less than", value: 'less-than' },
    { label: "Equal", value: 'equal' },
    { label: "Between", value: 'between' },
  ]
  sorts: { label: string, value: string | null }[] = [
    { label: "Ascending", value: 'asc' },
    { label: "Descending", value: 'desc' },
  ]

  readonly VOWELS: string[] = ["a", "e", "i", "o", "u"]
  private _cdr: ChangeDetectorRef = inject(ChangeDetectorRef)
  private _fb: FormBuilder = inject(FormBuilder)
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // -------------------
  // LIFE-CYCLE HOOKS
  // -------------------

  async ngOnInit() {
    await this.initData()

    this.initFilterForm()

    // Subscribe to value changes in order to handle sorting the current header
    this.initSortSub()

    // Subscribe to value changes in order to handle filtering the list
    this.filter_form.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(value => {
        console.log(value)
        // this.catchSearch(String(value))
      })

    // Subscribe to value changes and wait 1 second in order to simulate searching
    // for employee by id and returning if the name begins with a vowel.
    this.vowel_control.valueChanges
      .pipe(
        takeUntil(this._unsubscribeAll),
        filter(v => {
          if (v && v !== "") return v
          else this.response = null
        }),
        takeUntil(this._unsubscribeAll),
        map(v => {
          this.loading.set(true)
          this.vowel_control.setValue(v.replace(/[^0-9]/g, ''), { emitEvent: false })
          return v.replace(/[^0-9]/g, '')
        }),
        debounceTime(500)
      )
      .subscribe(v => {
        // this.vowel_control.setValue(v.replace(/[^0-9]/g, ''), { emitEvent: false })

        const regex = /^\d+$/;
        if (regex.test(v)) {
          const employee = this.list.find(d => d.id === Number(v))

          if (employee?.employee_name) {
            this.valid_response = checkForVowel(employee?.employee_name)
            if (checkForVowel(employee?.employee_name)) this.response = employee?.employee_name
            else this.response = "Employee’s name does not begin with a vowel"
          }
          else {
            this.valid_response = false
            this.response = "Invalid Employee ID"
          }
        }
        else {
          this.response = "Please enter a valid ID to check for vowels!"
          this.valid_response = false
        }
        this.loading.set(false)
        console.log(v)
      });
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
    this.sort_form.get('direction')?.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(value => {
        if (value) {
          this.sort_form.get('attribute')?.setValue(this.active_header.attr)
          this.sort_form.get('type')?.setValue(this.active_header.type)
        }
        else if (this.active_header.attr === this.sort_form.get('attribute')?.value) {
          this.sort_form.get('attribute')?.reset()
          this.sort_form.get('type')?.reset()
        }
        this.catchSort(this.sort_form.value)
      })
  }

  initFilterForm() {
    this.filter_form = this._fb.group({})

    // Use attributes in order to dynamically init the filter form
    this.attributes.forEach(a => {

      const form: FormGroup = this._fb.group({
        value: null
      })
      if (a.type === 'number') form.addControl('comparison', this._fb.control(null))

      this.filter_form.addControl(a.attr, form);
    });
  }

  formFilterControl(attribute: string): FormControl {
    return this.filter_form.get([attribute, 'value']) as FormControl
  }

  resetFilterControl = (attribute: string) => this.filter_form.get([attribute])?.reset();

  catchSearch(event: any, skip_update?: boolean) {
    let users = [...this.es.employees()]

    users = users.filter(u => {
      return u.employee_name?.toLocaleLowerCase()?.includes(event.toLocaleLowerCase()) ||
        String(u.id)?.toLocaleLowerCase()?.includes(event.toLocaleLowerCase()) ||
        String(u.employee_age)?.toLocaleLowerCase()?.includes(event.toLocaleLowerCase()) ||
        String(u.employee_salary)?.toLocaleLowerCase()?.includes(event.toLocaleLowerCase())
    })

    this.list = users
    this._cdr.markForCheck()
  }

  // applyFilter(event: Event) {
  //   const filterValue = (event.target as HTMLInputElement).value;
  //   this.dataSource.filter = filterValue.trim().toLowerCase();

  //   if (this.dataSource.paginator) {
  //     this.dataSource.paginator.firstPage();
  //   }
  // }

  setSortDirection(item: { value: any, label: string }, attr: string) {
    this.sort_form.get('direction')?.setValue(item.value);
    // console.log(item, attr)
    // if (!!item.value && this.sort_form.get('direction')?.value !== item.value && this.active_header.attr === attr)
    //   this.sort_form.get('direction')?.setValue(item.value);
    // else this.sort_form.get('direction')?.setValue(null);
  }

  catchSort(sort: any) {
    console.log(sort)
    if (sort.attribute && sort.type) {
      this.list = sortArray(this.list, sort.attribute, sort.type, sort.direction)
    }
    else this.list = this.es.employees()
  }

}
