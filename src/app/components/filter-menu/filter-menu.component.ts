import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { Subject, takeUntil } from 'rxjs';
import { BaseObjectModel, ignoreClick } from '../../data';

@Component({
  selector: 'app-filter-menu',
  templateUrl: './filter-menu.component.html',
  styleUrls: ['./filter-menu.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatButtonModule,
    MatChipsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterMenuComponent implements OnInit, OnDestroy {
  @Input() attr!: string
  @Input() type!: string
  @Input() filter_value?: any
  @Input() attributes!: BaseObjectModel[]

  filter_form!: FormGroup;
  ignoreClick = ignoreClick;
  comparisons: BaseObjectModel[] = [
    { label: "Greater than", value: 'greater-than' },
    { label: "Less than", value: 'less-than' },
    { label: "Equal", value: 'equal' },
    { label: "Between", value: 'between' },
  ]

  @Output() catchSearch = new EventEmitter()

  private _cdr: ChangeDetectorRef = inject(ChangeDetectorRef)
  private _fb: FormBuilder = inject(FormBuilder)
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // -------------------
  // LIFE-CYCLE HOOKS
  // -------------------

  async ngOnInit() {
    // Init filter form
    this.filter_form = this._fb.group({})

    // Use attributes in order to dynamically init the filter form
    this.attributes.forEach(a => {
      const attribute: string = a.attr as string

      // Create form for each attribute
      const form: FormGroup = this._fb.group({
        value: [null, [Validators.required]],
        type: a.type,
        label: a.label
      })

      // If attribute is a number add the comparison and value_2 controls to the form, also add subscriptions to make sure that values are never in valid (ie, min > max || max < min)
      if (a.type === 'number') {
        form.addControl('comparison', this._fb.control(null, [Validators.required]))
        form.addControl('value_2', this._fb.control(null, [Validators.required]));

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

      // If there is a value already in place for this filter, add it and make sure we can reset the filter
      form.patchValue(this.filter_value?.[attribute])
      if (this.filter_value?.[attribute]?.value) form.markAsDirty();

      this.filter_form.addControl(attribute, form);
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

  // -------------------
  // PUBLIC METHODS
  // -------------------

  applyFilter(attribute: string) {
    const value = this.filter_form.value
    this.filter_form.get([attribute])?.markAsPristine();
    this.catchSearch.emit(value)
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

  toggleFilterFormComparison(attribute: string, value: string | undefined) {
    this.formFilterComparisonControl(attribute).setValue(value)
    this.filter_form.get(attribute)?.markAsDirty()
  }

  resetFilterControl = (attribute: string) => {
    this.filter_form.get([attribute])?.reset(null);
    this._cdr.markForCheck()
    this.catchSearch.emit(this.filter_form.value)
  }
}
