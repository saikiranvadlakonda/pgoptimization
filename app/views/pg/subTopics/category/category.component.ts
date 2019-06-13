import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TocItemViewModel } from '../../../../shared/models/practiceAreas';

@Component({
    selector: 'category',
    templateUrl: './category.component.html',
    styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {

    @Input() practiceAreaDet: TocItemViewModel;
    @Output() subTopic: EventEmitter<TocItemViewModel> = new EventEmitter<TocItemViewModel>();
    subTopicLength: number = 9;
    paModules: TocItemViewModel[] = [];
    paSubTopics: TocItemViewModel[] = [];
    modulesLength: number = 15;
    activeIds: string[] = [];
    partition: number;
    isSubTopicViewEnabled: boolean = false;

    constructor() {

    }

    ngOnInit() {
        if (this.practiceAreaDet != undefined)
        this.getSubTopics(this.practiceAreaDet);
    }

    getSubTopics(selectedPracticeArea) {
        this.subTopicLength = 9;
        this.paSubTopics = [];
        /*selectedPracticeArea.subTocItem.forEach(topic => {
            if (topic.type === 'TP') {
                this.paSubTopics = [...this.paSubTopics, topic];
            } else {
                this.paModules = [...this.paModules, topic];
            }
        });*/

        selectedPracticeArea.subTocItem.forEach(topic => {
            if (topic.title.toLowerCase() != "introduction")
            if (topic.type === 'TP') {
                this.paSubTopics = [...this.paSubTopics, topic];
            } else {
                this.setSubTopics(topic);
            }
        });

        if (this.paSubTopics.length >= 9)
            this.partition = Math.ceil(this.subTopicLength / 3);
        else
            this.partition = Math.ceil(this.paSubTopics.length / 3);
    }

    setSubTopics(modules) {
        modules.subTocItem.forEach(topic => {
            if (topic.type === 'TP') {
                this.paSubTopics = [...this.paSubTopics, topic];
            } else {
                this.setSubTopics(topic);
            }
        });
    }

    navigateToGuidance(subtopic) {
        this.subTopic.emit(subtopic);
    }

    showSubTopicsOfModule(paModule: TocItemViewModel) {
        this.getSubTopics(paModule);
        this.isSubTopicViewEnabled = true;
    }

    /*showMoreSubtopic() {
        this.subTopicLength = this.subTopics.length;
    }

    showLessSubtopic() {
        this.subTopicLength = 12;
    }*/

    toggleShowMoreModules(isShowMore: boolean): void {
        if (isShowMore)
            this.modulesLength = this.paModules.length;
        else
            this.modulesLength = 15;
    }

    toggleShowMoreSubTopics(): void {
        if (this.subTopicLength > 9)
            this.subTopicLength = 9;
        else 
            this.subTopicLength = this.paSubTopics.length;
    }

    expandOrCollpaseAll(): void {
        if (this.activeIds.length == 0) {
            this.activeIds = this.paSubTopics.map((ele, ind) => "mainpanel-" + ind);
        } else {
            this.activeIds = [];
        }
    }

    addOrRemoveActivePanel(id: number): void {
        let index: number = this.activeIds.indexOf('mainpanel-' + id);
        if (index > -1) {
            this.activeIds.splice(index, 1);
        } else {
            this.activeIds.push('mainpanel-' + id);
        }
    }
}
