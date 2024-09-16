import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, filter, map, Subject, takeUntil } from 'rxjs';
import { checkForVowel, EmployeesService, ignoreClick } from '../../data';

@Component({
  selector: 'app-vowel-search',
  templateUrl: './vowel-search.component.html',
  styleUrls: ['./vowel-search.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    MatTooltipModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VowelSearchComponent implements OnInit, OnDestroy {
  loading: WritableSignal<boolean> = signal(false)
  es: EmployeesService = inject(EmployeesService)
  vowel_control: FormControl = new FormControl<string>("")

  response!: string | null
  valid_response!: boolean

  ignoreClick = ignoreClick;

  readonly tooltipText = "Enter an employee ID in the search bar below, and if the corresponding employees name starts with a vowel, the employees name will be displayed, if not an error message will appear.";
  readonly VOWELS: string[] = ["a", "e", "i", "o", "u"]

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // -------------------
  // LIFE-CYCLE HOOKS
  // -------------------

  async ngOnInit() {
    // Subscribe to value changes and wait 1 second in order to simulate searching
    // for employee by id and returning if the name begins with a vowel.
    this.vowel_control.valueChanges
      .pipe(
        takeUntil(this._unsubscribeAll),
        filter(v => {
          // Only trigger the subscription once a value has been input
          if (v && v !== "") return v
          else this.response = null
        }),
        takeUntil(this._unsubscribeAll),
        map(v => {
          // Activate loading when the value is changed
          this.loading.set(true)
          // remove all characters unless they are digits and return the stripped string
          this.vowel_control.setValue(v.replace(/[^0-9]/g, ''), { emitEvent: false })
          return v.replace(/[^0-9]/g, '')
        }),
        // Wait half a second to simulate waiting and calculating
        debounceTime(500)
      )
      .subscribe(v => {
        const regex = /^\d+$/;
        // If value entered is a number
        if (regex.test(v)) {
          const employee = this.es.employees().find(d => d.id === Number(v))

          // If the employee was found
          if (employee?.employee_name) {
            this.valid_response = checkForVowel(employee?.employee_name)
            // If the employees name starts with a vowel
            if (checkForVowel(employee?.employee_name)) this.response = employee?.employee_name
            // If the employees name doesn't starts with a vowel
            else this.response = "Employee's name does not begin with a vowel"
          }
          // If the employee was not found
          else {
            this.valid_response = false
            this.response = "Invalid employee ID"
          }
        }
        // If value entered was a removed character then display this error
        else {
          this.response = "Please enter a valid ID to check for vowels!"
          this.valid_response = false
        }
        this.loading.set(false)
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


}
