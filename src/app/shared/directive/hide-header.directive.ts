import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Directive, Input, OnInit, Renderer2, HostListener, ElementRef } from '@angular/core';
import { DomController } from '@ionic/angular';

@Directive({
  selector: '[HideToolbarDirective]',
})
export class HideHeaderDirective implements OnInit {

  constructor(private el: ElementRef, private domController: DomController, private renderer: Renderer2) {}

  @Input("HideToolbarDirective") toolbar: any;
  @Input() viewport: CdkVirtualScrollViewport;

  toolbarHeight = 60;
  previousScrollPosition = 0;

  ngOnInit(): void {
    this.toolbar = this.toolbar.el;

    this.domController.write(() => {
      this.renderer.setStyle(this.toolbar, 'z-index', '1');
      this.renderer.setStyle(this.toolbar, 'top', '0px');
      this.renderer.setStyle(this.toolbar, 'webkitTransition', 'top 500ms');
    });
  }

  @HostListener('ionScroll', ['$event'])
  onContentScroll(event:CustomEvent){
    const scrollTop = event.detail.scrollTop;

    if (scrollTop > this.toolbarHeight && scrollTop > this.previousScrollPosition && (scrollTop - this.previousScrollPosition) > this.toolbarHeight){
      this.domController.write(() => {
        this.renderer.setStyle(this.toolbar, 'top', `${-this.toolbarHeight}px`);
      });

      this.previousScrollPosition = scrollTop;
    }
    else if (scrollTop < this.previousScrollPosition && (this.previousScrollPosition - scrollTop) > this.toolbarHeight){
      this.domController.write(() => {
        this.renderer.setStyle(this.toolbar, 'top', '0px');
      });

      this.previousScrollPosition = scrollTop;
    }
  }
}
