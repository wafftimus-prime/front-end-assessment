import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-sort-menu',
  templateUrl: './sort-menu.component.html',
  styleUrls: ['./sort-menu.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatChipsModule,
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
        // If the direction is not null, set the attribute and type to the active header
        if (value) {
          this.sort_form.get('attribute')?.setValue(this.active_header.attr)
          this.sort_form.get('type')?.setValue(this.active_header.type)
        }
        // If the direction is null then reset all other form controls
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
