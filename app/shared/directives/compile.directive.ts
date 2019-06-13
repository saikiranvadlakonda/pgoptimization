import { Directive, Input, OnChanges, ComponentRef, ViewContainerRef, Compiler, ModuleWithComponentFactories, Component, NgModule, Type, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageSrcModule } from '../../views/pg/image-src/image-src.module';

@Directive({
    selector: '[compile]'
})
export class CompileDirective implements OnChanges {
    @Input() compile: string;
    @Input() compileContext: any;

    compRef: ComponentRef<any>;

    constructor(private vcRef: ViewContainerRef, private compiler: Compiler) { }

    ngOnChanges() {
        if (!this.compile) {
            if (this.compRef) {
                this.updateProperties();
                return;
            }
            throw Error('You forgot to provide template');
        }

        this.vcRef.clear();
        this.compRef = null;

        const component = this.createDynamicComponent(this.compile);
        const module = this.createDynamicModule(component);
        this.compiler.compileModuleAndAllComponentsAsync(module)
            .then((moduleWithFactories: ModuleWithComponentFactories<any>) => {
                let compFactory = moduleWithFactories.componentFactories.find(x => x.componentType === component);

                this.compRef = this.vcRef.createComponent(compFactory);
                this.updateProperties();
            })
            .catch(error => {
            });
    }

    updateProperties() {
        for (var prop in this.compileContext) {
            if (prop === 'downloadContent') {
                this.compRef.instance[prop] = (dpath, hasChildren) => {
                    this.compileContext.downloadContent(dpath, hasChildren);
                }
            }else if (prop === 'buildHtml') {
                this.compRef.instance[prop] = (input: string) => {
                   return this.compileContext.buildHtml(input);
                }
            } else if (prop === 'openGuidanceDetail') {
                this.compRef.instance[prop] = (dpath, hasChildren) => {
                    return this.compileContext.openGuidanceDetail(dpath, hasChildren);
                }
            } else if (prop === 'back') {
                this.compRef.instance[prop] = () => {
                    return this.compileContext.back();
                }
            } else if (prop === 'ngAfterViewInit') {
                this.compRef.instance[prop] = () => {
                    return this.compileContext.ngAfterViewInit();
                }
            } else {
                this.compRef.instance[prop] = this.compileContext[prop];
            }
            //this.compRef.instance[prop] = this.compileContext[prop];
        }
    }

    private createDynamicComponent(template: string) {
        @Component({
            selector: 'custom-dynamic-component',
            template: template,
        })
        class CustomDynamicComponent implements AfterViewInit {
            ngAfterViewInit() {
            }
        }
        return CustomDynamicComponent;
    }

    private createDynamicModule(component: Type<any>) {
        @NgModule({
            // You might need other modules, providers, etc...
            // Note that whatever components you want to be able
            // to render dynamically must be known to this module
            imports: [CommonModule, ImageSrcModule],
            declarations: [component]
        })
        class DynamicModule { }
        return DynamicModule;
    }
}