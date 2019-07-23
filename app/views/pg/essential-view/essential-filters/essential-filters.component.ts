import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-essential-filters',
  templateUrl: './essential-filters.component.html',
  styleUrls: ['./essential-filters.component.scss']
})
export class EssentialFiltersComponent implements OnInit {

  @Input() isMobiResolution: boolean;
  @Input() topics: any;
  @Input() documentType: any;
  @Output() clearSearch: EventEmitter<any> = new EventEmitter<any>();
  @Output() collapseSearch: EventEmitter<any> = new EventEmitter<any>();
  @Output() searchQueryEnter: EventEmitter<string> = new EventEmitter<string>();
  @Output() updatePagination: EventEmitter<string> = new EventEmitter<string>();
  @Output() clearAllTopics: EventEmitter<any> = new EventEmitter<any>();
  @Output() selectAllTopics: EventEmitter<any> = new EventEmitter<any>();
  @Output() getEssentialsForSelectedTopics: EventEmitter<any> = new EventEmitter<any>();
  @Output() setSeletedTopic: EventEmitter<any> = new EventEmitter<any>();
  @Output() setAllDocumentType: EventEmitter<any> = new EventEmitter<any>();
  @Output() setDocumentType: EventEmitter<any> = new EventEmitter<any>();

  searchEssential: string;
  isTopicSelected: boolean = true;

  constructor() { }

  ngOnInit() {
  }

  onSearchQueryEnter(event: KeyboardEvent): void {
    if (event.keyCode == 13) {
      this.searchQueryEnter.emit(this.searchEssential);
    }
  }

  onClearSearch(): void {
    this.searchEssential = '';
    this.clearSearch.emit();
  }

  onCollapseSearch(): void {
    this.collapseSearch.emit();
  }

  onUpdatePagination(): void {
    this.updatePagination.emit(this.searchEssential);
  }

  onClearAllTopics(): void {
    this.isTopicSelected = false;
    this.clearAllTopics.emit();
  }

  onSelectAllTopics(): void {
    this.isTopicSelected = true;
    this.selectAllTopics.emit();
  }

  onGetEssentialsForSelectedTopics(): void {
    this.getEssentialsForSelectedTopics.emit();
  }

  onSetSeletedTopic(title: string, isChecked: boolean): void {
    this.isTopicSelected = true;
    let eventData: any = {
      title: title,
      isChecked: isChecked
    }
    this.setSeletedTopic.emit(eventData);
  }

  onSetAllDocumentType(): void {
    this.setAllDocumentType.emit();
  }

  onSetDocumentType(title: string, isChecked: boolean): void {
    let eventData: any = {
      title: title,
      isChecked: isChecked
    }
    this.setDocumentType.emit(eventData);
  }

}
