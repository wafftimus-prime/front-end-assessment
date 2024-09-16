import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { checkForVowel, EmployeesService, ignoreClick } from '../../data';

@Component({
  selector: 'app-sort-menu',
  templateUrl: './sort-menu.component.html',
  styleUrls: ['./sort-menu.component.scss'],
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
export class SortMenuComponent implements OnInit, OnDestroy {
  @Input() attr!: string
  @Input() sort_form!: FormGroup
  @Input() active_header!: { label: string, type: string, attr: string }

  @Output() catchSort = new EventEmitter()

  sorts: { label: string, value: string | null }[] = [
    { label: "Ascending", value: 'asc' },
    { label: "Descending", value: 'desc' },
  ]

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // -------------------
  // LIFE-CYCLE HOOKS
  // -------------------

  async ngOnInit() {
    this.sort_form.get('direction')?.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(value => {
        console.log(value)
        if (value) {
          this.sort_form.get('attribute')?.setValue(this.active_header.attr)
          this.sort_form.get('type')?.setValue(this.active_header.type)
        }
        else {
          this.sort_form.get('attribute')?.reset()
          this.sort_form.get('type')?.reset()
          this.sort_form.get('attribute')?.updateValueAndValidity()
          this.sort_form.get('type')?.updateValueAndValidity()
        }
        this.catchSort.emit(this.sort_form.value)
      })

  }

  /**
   * On destroy
  */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }


}
