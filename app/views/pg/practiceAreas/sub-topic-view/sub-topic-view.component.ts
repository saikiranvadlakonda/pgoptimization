import { Component, OnInit, Input,Output,ChangeDetectionStrategy, EventEmitter } from '@angular/core';
import { SubTocItemViewModel } from '../../../../shared/models/practiceAreas/subTocItem.model';

@Component({
  selector: 'app-sub-topic-view',
  templateUrl: './sub-topic-view.component.html',
  styleUrls: ['./sub-topic-view.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubTopicViewComponent implements OnInit {

    @Input() subtopic: SubTocItemViewModel;
    @Output() subTopic: EventEmitter<SubTocItemViewModel> = new EventEmitter<SubTocItemViewModel>();

  constructor() { }

  ngOnInit() {
  }

  setSubTopicDomainPath(subtopic) {
      this.subTopic.emit(subtopic);
  }

}
