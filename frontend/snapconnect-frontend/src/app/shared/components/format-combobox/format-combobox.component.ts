import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export const PREDEFINED_FORMATS: string[] = [
  '9:16 Vertical — TikTok / Reels / Shorts',
  '16:9 Horizontal — YouTube / Facebook',
  '1:1 Carré — Instagram',
  '4:5 Portrait — Instagram',
  'Autre — à préciser'
];

@Component({
  selector: 'app-format-combobox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormatComboboxComponent),
      multi: true
    }
  ],
  template: `
    <div class="combobox-container" #comboboxRoot>
      <div class="combobox-input-wrapper" [class.is-focused]="isOpen">
        <input
          #formatInput
          type="text"
          class="form-input combobox-input"
          [placeholder]="placeholder"
          [value]="value"
          (input)="onInputChange($event)"
          (focus)="onInputFocus()"
          (click)="onInputClick()"
          (keydown)="onKeyDown($event)"
          autocomplete="off"
          [disabled]="disabled"
        />

        <button
          type="button"
          class="combobox-toggle-btn"
          (click)="toggleDropdown($event)"
          [attr.aria-expanded]="isOpen"
          tabindex="-1"
          title="Afficher les options prédéfinies"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="chevron-icon"
            [class.rotated]="isOpen"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>

      <!-- Liste déroulante des options -->
      @if (isOpen) {
        <div class="combobox-dropdown animate-fade-in" role="listbox">
          @for (option of options; track option; let idx = $index) {
            <div
              class="combobox-option"
              [class.is-selected]="isSelected(option)"
              [class.is-custom-trigger]="option === customOptionLabel"
              [class.is-active]="activeIndex === idx"
              (click)="selectOption(option)"
              role="option"
              [attr.aria-selected]="isSelected(option)"
            >
              <div class="option-content">
                @if (option === customOptionLabel) {
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="option-icon custom-icon">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                } @else {
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="option-icon">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                  </svg>
                }
                <span class="option-text">{{ option }}</span>
              </div>

              @if (isSelected(option)) {
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="check-icon">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .combobox-container {
      position: relative;
      width: 100%;
    }

    .combobox-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }

    .combobox-input {
      width: 100%;
      padding: 0.75rem 2.5rem 0.75rem 1rem;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      color: var(--color-text-primary);
      font-family: var(--font-family);
      font-size: var(--font-size-base);
      line-height: var(--line-height-normal);
      outline: none;
      transition: all var(--transition-fast);
    }

    .combobox-input::placeholder {
      color: var(--color-text-muted);
    }

    .combobox-input-wrapper.is-focused .combobox-input,
    .combobox-input:focus {
      border-color: var(--color-primary-500);
      box-shadow: 0 0 0 3px var(--color-primary-light), 0 0 16px var(--color-primary-glow);
    }

    .combobox-toggle-btn {
      position: absolute;
      right: 0.5rem;
      top: 50%;
      transform: translateY(-50%);
      background: transparent;
      border: none;
      color: var(--color-text-secondary);
      padding: 0.4rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: color var(--transition-fast), background var(--transition-fast);
    }

    .combobox-toggle-btn:hover {
      color: var(--color-text-primary);
      background: rgba(255, 255, 255, 0.06);
    }

    .chevron-icon {
      transition: transform var(--transition-fast);
    }

    .chevron-icon.rotated {
      transform: rotate(180deg);
      color: var(--color-primary-400);
    }

    /* ── Dropdown Menu ── */
    .combobox-dropdown {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      right: 0;
      z-index: var(--z-dropdown, 100);
      background: rgba(18, 24, 38, 0.97);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: var(--radius-md);
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.55), 0 0 20px rgba(139, 92, 246, 0.18);
      overflow: hidden;
      padding: 4px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      max-height: 280px;
      overflow-y: auto;
    }

    .combobox-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.65rem 0.85rem;
      border-radius: var(--radius-sm);
      color: var(--color-text-primary);
      font-size: var(--font-size-sm);
      cursor: pointer;
      transition: all var(--transition-fast);
      user-select: none;
    }

    .combobox-option:hover,
    .combobox-option.is-active {
      background: rgba(139, 92, 246, 0.15);
      color: #ffffff;
      transform: translateX(2px);
    }

    .combobox-option.is-selected {
      background: rgba(139, 92, 246, 0.22);
      color: var(--color-primary-300);
      font-weight: var(--font-weight-medium);
    }

    .combobox-option.is-custom-trigger {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      margin-top: 2px;
      color: var(--color-primary-300);
      font-weight: var(--font-weight-medium);
    }

    .combobox-option.is-custom-trigger:hover {
      background: rgba(139, 92, 246, 0.25);
      color: #ffffff;
    }

    .option-content {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .option-icon {
      color: var(--color-text-muted);
      flex-shrink: 0;
    }

    .combobox-option:hover .option-icon,
    .combobox-option.is-selected .option-icon {
      color: var(--color-primary-400);
    }

    .custom-icon {
      color: var(--color-primary-400);
    }

    .option-text {
      line-height: 1.35;
    }

    .check-icon {
      color: var(--color-primary-400);
      flex-shrink: 0;
      margin-left: 8px;
    }

    /* Scrollbar */
    .combobox-dropdown::-webkit-scrollbar {
      width: 6px;
    }
    .combobox-dropdown::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.1);
    }
    .combobox-dropdown::-webkit-scrollbar-thumb {
      background: rgba(139, 92, 246, 0.3);
      border-radius: 3px;
    }
  `]
})
export class FormatComboboxComponent implements ControlValueAccessor {
  @ViewChild('formatInput') formatInputElement!: ElementRef<HTMLInputElement>;
  @ViewChild('comboboxRoot') comboboxRoot!: ElementRef<HTMLElement>;

  @Input() placeholder: string = 'Écrire ou sélectionner un format...';
  @Input() value: string = '';
  @Input() disabled: boolean = false;
  @Output() valueChange = new EventEmitter<string>();

  readonly options: string[] = PREDEFINED_FORMATS;
  readonly customOptionLabel = 'Autre — à préciser';

  isOpen: boolean = false;
  activeIndex: number = -1;

  // ControlValueAccessor callbacks
  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: any): void {
    this.value = val != null ? String(val) : '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.setValue(target.value);
  }

  onInputFocus(): void {
    this.isOpen = true;
    this.onTouched();
  }

  onInputClick(): void {
    this.isOpen = true;
  }

  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      setTimeout(() => this.formatInputElement?.nativeElement?.focus());
    }
  }

  selectOption(option: string): void {
    if (option === this.customOptionLabel) {
      // If user clicks « Autre — à préciser », clear or select input and give immediate focus
      this.isOpen = false;
      this.setValue('');
      setTimeout(() => {
        const input = this.formatInputElement?.nativeElement;
        if (input) {
          input.focus();
          input.select();
        }
      }, 50);
      return;
    }

    this.setValue(option);
    this.isOpen = false;
  }

  isSelected(option: string): boolean {
    if (!this.value) return false;
    return this.value.trim() === option.trim();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.isOpen = false;
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!this.isOpen) {
        this.isOpen = true;
        this.activeIndex = 0;
      } else {
        this.activeIndex = (this.activeIndex + 1) % this.options.length;
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!this.isOpen) {
        this.isOpen = true;
        this.activeIndex = this.options.length - 1;
      } else {
        this.activeIndex = (this.activeIndex - 1 + this.options.length) % this.options.length;
      }
      return;
    }

    if (event.key === 'Enter') {
      if (this.isOpen && this.activeIndex >= 0 && this.activeIndex < this.options.length) {
        event.preventDefault();
        this.selectOption(this.options[this.activeIndex]);
      } else {
        this.isOpen = false;
      }
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (this.isOpen && this.comboboxRoot) {
      const clickedInside = this.comboboxRoot.nativeElement.contains(event.target as Node);
      if (!clickedInside) {
        this.isOpen = false;
      }
    }
  }

  private setValue(val: string): void {
    this.value = val;
    this.onChange(val);
    this.valueChange.emit(val);
  }
}
