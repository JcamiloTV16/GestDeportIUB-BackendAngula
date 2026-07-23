import { Directive, ElementRef, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';

declare var $: any;

@Directive({
  selector: '[appDataTable]',
  standalone: true
})
export class DataTableDirective implements OnChanges, OnDestroy {
  @Input() appDataTable: any[] = [];
  
  private dataTable: any;

  constructor(private readonly el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appDataTable'] && this.appDataTable && this.appDataTable.length > 0) {
      this.initDataTable();
    } else if (this.appDataTable && this.appDataTable.length === 0) {
      this.destroyDataTable();
    }
  }

  private initDataTable() {
    // Wait for Angular to render the ngFor elements
    setTimeout(() => {
      if (!this.el?.nativeElement || !document.body.contains(this.el.nativeElement)) {
        return;
      }
      this.destroyDataTable();
      
      try {
        this.dataTable = $(this.el.nativeElement).DataTable({
          language: {
            url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json',
          },
          destroy: true, // Allow re-initialization
          responsive: true
        });
      } catch (e) {
        // Safe catch for transient DOM destruction
      }
    }, 50);
  }

  private destroyDataTable() {
    try {
      if (this.dataTable) {
        this.dataTable.destroy(true);
        this.dataTable = null;
      } else if (this.el?.nativeElement && $.fn?.DataTable?.isDataTable(this.el.nativeElement)) {
        $(this.el.nativeElement).DataTable().destroy(true);
      }
    } catch (e) {
      this.dataTable = null;
    }
  }

  ngOnDestroy(): void {
    this.destroyDataTable();
  }
}

