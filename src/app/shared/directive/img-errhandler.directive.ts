import { Directive, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, Renderer2, SimpleChanges } from '@angular/core';
import { DomController } from '@ionic/angular';
import { CORS_PROXY_URL, IMG_LOAD } from 'src/app/helpers/constents';
import { placeholderImage } from 'src/app/helpers/functions';
import { AppDataShareService } from 'src/app/services/app-data-share.service';

@Directive({
  selector: '[ImgErrhandler]'
})
export class ImgErrhandlerDirective implements OnInit, OnChanges {

  constructor(
    private el: ElementRef,
    private domController: DomController,
    private renderer: Renderer2,
    private appDataShareService: AppDataShareService
  ) { }

  @Input() thumnailUrl: string = null;
  @Input() imgUrl: string = null;
  @Input() imgWidth: string = null;
  @Input() imgHeight: string = null;

  @Output() imgError = new EventEmitter();

  currentLoadStatus:string = null;
  errorStatus = {
    thumnail: false,
    img: false
  }

  ngOnInit(): void {
    this.init();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.imgUrl.firstChange){
      this.reset();
      this.init();
    }
  }

  init(){
    this.domController.write(() => {
      this.currentLoadStatus = IMG_LOAD.placeholder;
      this.renderer.setAttribute(this.el.nativeElement, 'src', placeholderImage(this.imgWidth, this.imgHeight));
    });
  }

  reset(){
    this.errorStatus = {
      thumnail: false,
      img: false
    }
  }

  @HostListener('load')
  @HostListener('ionImgDidLoad')
  async onLoad(){
    if (this.currentLoadStatus === IMG_LOAD.placeholder){
      this.currentLoadStatus = IMG_LOAD.thumnail;

      let imgUrl = null;
      const local_url = this.findLocalImgUrl(this.thumnailUrl);

      if (local_url === null){
        imgUrl = await this.downloadImg(this.thumnailUrl);
        
        if (imgUrl != null){
          this.appDataShareService.imageResourceLocater.push({original_url: this.thumnailUrl, local_url: imgUrl});
        }
      }
      else{
        imgUrl = local_url;
      }

      if (imgUrl){
        this.domController.write(() => {
          this.renderer.setAttribute(this.el.nativeElement, 'src', imgUrl);
        });
      }
      else{
        this.errorStatus.thumnail = true;
        this.onLoad();
      }
    }
    else if (this.currentLoadStatus === IMG_LOAD.thumnail){
      this.currentLoadStatus = IMG_LOAD.img;

      let imgUrl = null;
      const local_url = this.findLocalImgUrl(this.imgUrl);

      if (local_url === null){
        imgUrl = await this.downloadImg(`${CORS_PROXY_URL}${this.imgUrl}`);
        
        if (imgUrl != null){
          this.appDataShareService.imageResourceLocater.push({original_url: this.imgUrl, local_url: imgUrl});
        }
      }
      else{
        imgUrl = local_url;
      }


      if (imgUrl){
        this.domController.write(() => {
          this.renderer.setAttribute(this.el.nativeElement, 'src', imgUrl);
        });
      }
      else{
        this.errorStatus.img = true;
        const local_thumnail_url = this.findLocalImgUrl(this.thumnailUrl);

        if (!this.errorStatus.thumnail && local_thumnail_url != null){
          this.domController.write(() => {
            this.renderer.setAttribute(this.el.nativeElement, 'src', local_thumnail_url);
          });
        }
        else{
          this.domController.write(() => {
            this.renderer.setAttribute(this.el.nativeElement, 'src', placeholderImage(this.imgWidth, this.imgHeight));
          });
        }

        this.imgError.emit(this);
      }
    }
  }

  async reTry(){
    if (this.errorStatus.img){
      let imgUrl = null;
      const local_url = this.findLocalImgUrl(this.imgUrl);

      if (local_url === null){
        imgUrl = await this.downloadImg(`${CORS_PROXY_URL}${this.imgUrl}`);
        
        if (imgUrl != null){
          this.appDataShareService.imageResourceLocater.push({original_url: this.imgUrl, local_url: imgUrl});
        }
      }
      else{
        imgUrl = local_url;
      }

      if (imgUrl){
        this.domController.write(() => {
          this.renderer.setAttribute(this.el.nativeElement, 'src', imgUrl);
        });
      }
      else{
        this.imgError.emit(this);
      }
    }
  }


  async downloadImg(imgSrc): Promise<string>{
    return new Promise<string>((resolve, reject) => {
      fetch(imgSrc).then(async (response) => {
        if (response.ok){
          const imageBlog = await response.blob();
          const imageURL = URL.createObjectURL(imageBlog);
          return resolve(imageURL);
        }
        else{
          return resolve(null);
        }
      })
      .catch(() => {
        resolve(null);
      });
    });
  }

  findLocalImgUrl(original_url:string){
    const imageResourceIndex = this.appDataShareService.imageResourceLocater.findIndex(item => item.original_url === original_url);

    if (imageResourceIndex != -1){
      return this.appDataShareService.imageResourceLocater[imageResourceIndex].local_url;
    }
    else{
      return null
    }
  }
}
