import { Component, isDevMode, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { of, Subject } from 'rxjs';
import { DEV_PROD, ERROR_MESSAGE, REGEX } from 'src/app/helpers/constents';
import { LocationService } from 'src/app/services/location.service';
import { Keyboard } from '@capacitor/keyboard';
import {Capacitor} from "@capacitor/core";
import { INTEREST_CATEGORY, INTEREST_KEYWORD, LOCATION_JSON } from 'src/app/helpers/models';
import { catchError, debounceTime, distinctUntilChanged, filter, map, switchMap, take, takeUntil } from 'rxjs/operators';
import { GraphqlService } from 'src/app/services/graphql.service';
import { ALL_INTEREST_CATEGORY, EMAIL_CHECK, USERNAME_CHECK, USER_REGISTRATION } from 'src/app/helpers/graphql.query';
import { MatStepper } from '@angular/material/stepper';
import { IonicControllerService } from 'src/app/services/ionic-controller.service';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  constructor(
    private title:Title,
    private meta:Meta,
    private graphqlService: GraphqlService,
    private locationService:LocationService,
    private ionicControllerService: IonicControllerService
  ) { }

  metaTags:MetaDefinition[] = [
    {name: "title", content: "Create Account | Wave"},
    {name: "description", content: "Signup and team up to explore your curiosity together, in the company of others like you."}
  ];

  wave_long_logo_url:string;
  privacy_policy_url:string;
  terms_and_conditions_url:string;
  email_send_url:string;

  destroy$: Subject<boolean> = new Subject<boolean>();

  loading = false;
  removeContent = false;

  signupForm: FormGroup;

  locationLoading = false;
  locationData:LOCATION_JSON = null;

  usernameChecked = false;
  emailChecked = false;
  confirmPasswordHidden = true;

  interestCategory:INTEREST_CATEGORY[] = [];
  selectedCategory:INTEREST_CATEGORY = null;
  interestSelectedCount = 0;
  interestView = false;

  minYear:Date;
  maxYear:Date;

  resetState(){
    this.loading = false;
    this.locationLoading = false;
    this.usernameChecked = false;
    this.emailChecked = false;
    this.confirmPasswordHidden = true;
    this.interestSelectedCount = 0;
    this.selectedCategory = null;
    this.interestView = false;
  }


  ngOnInit(){
    this.title.setTitle("Create Account | Wave");
    this.meta.addTags(this.metaTags);

    if (isDevMode()){
      this.wave_long_logo_url = 'assets/svg/long-logo.svg';
      this.privacy_policy_url = DEV_PROD.httpServerUrl_dev +'privacy-policy/';
      this.terms_and_conditions_url = DEV_PROD.httpServerUrl_dev + 'terms-and-conditions/';
      this.email_send_url = 'assets/svg/email_send.svg';
    }
    else{
      this.wave_long_logo_url = DEV_PROD.staticUrl_prod + 'assets/svg/long-logo.svg';
      this.privacy_policy_url = DEV_PROD.httpServerUrl_prod +'privacy-policy/';
      this.terms_and_conditions_url = DEV_PROD.httpServerUrl_prod + 'terms-and-conditions/';
      this.email_send_url = DEV_PROD.staticUrl_prod + 'assets/svg/email_send.svg';
    }

    this.minYear = new Date();
    this.maxYear = new Date();
    this.minYear.setFullYear(this.minYear.getFullYear() - 70);
    this.maxYear.setFullYear(this.maxYear.getFullYear() - 16);

    this.createSignupForm();
  }

  ionViewWillEnter(){
    this.removeContent = false;
  }

  ionViewDidEnter(){
    this.destroy$ = new Subject<boolean>();

    if (this.locationData === null){
      this.getLocation();
    }
    else{
      this.signupForm.get('personalDetails.location')
      .setValue(`${this.locationData.region.name}, ${this.locationData.country_code}`);
    }

    this.signupForm.get('loginDetails.username').valueChanges.pipe(
      map(value => {
        this.usernameChecked = false;
        return value;
      }),
      debounceTime(1000),
      distinctUntilChanged(),
      filter(value => REGEX.username_validation.test(value) && value != ""),
      switchMap((value:String):any => {
        this.usernameChecked = null;
        return this.graphqlService.graphqlMutation(USERNAME_CHECK, {username: value}).pipe(
          take(1),
          catchError(error => {return of({result: null})})
        );
      }),
      takeUntil(this.destroy$),
    )
    .subscribe((result:any) => {
      if (result.data?.emailUsernameCheck?.username === true){
        this.signupForm.get('loginDetails.username').setErrors(null);
        this.usernameChecked = true;
      }
      else{
        this.signupForm.get('loginDetails.username').setErrors({'usernameTaken': true});
        this.usernameChecked = false;
      }
    });

    this.signupForm.get('loginDetails.email').valueChanges.pipe(
      map(value => {
        this.emailChecked = false;
        return value;
      }),
      debounceTime(1000),
      distinctUntilChanged(),
      filter(value => REGEX.email_validation.test(value) && value != ""),
      switchMap((value:String):any => {
        this.emailChecked = null;
        return this.graphqlService.graphqlMutation(EMAIL_CHECK, {email: value}).pipe(
          take(1),
          catchError(error => {return of({result: null})})
        );
      }),
      takeUntil(this.destroy$),
    )
    .subscribe((result:any) => {
      if (result.data?.emailUsernameCheck?.email === true){
        this.signupForm.get('loginDetails.email').setErrors(null);
        this.emailChecked = true;
      }
      else{
        this.signupForm.get('loginDetails.email').setErrors({'emailTaken': true});
        this.emailChecked = false;
      }
    });
  }

  createSignupForm(){
    this.signupForm = new FormGroup({
      'personalDetails': new FormGroup({
        'fullname': new FormControl(null, [Validators.required, Validators.maxLength(50), Validators.pattern(REGEX.alphabet_validation.source)]),
        'nickname': new FormControl(null, [Validators.required, Validators.maxLength(50), Validators.pattern(REGEX.alphabet_validation.source)]),
        'dob': new FormControl({value:null, disabled:true}, Validators.required),
        'gender': new FormControl(null, Validators.required),
        'location': new FormControl({value:null, disabled:true}),
      }),
      'loginDetails': new FormGroup({
        'username': new FormControl(null, [Validators.required, Validators.pattern(REGEX.username_validation.source)]),
        'email': new FormControl(null, [Validators.required, Validators.pattern(REGEX.email_validation.source)]),
        'password': new FormControl(null, [Validators.required, Validators.pattern(REGEX.password_validation.source)]),
        'confirmPassword': new FormControl(null, Validators.required),
      }, {validators: this.passwordMatchValidator})
    });
  }

  passwordMatchValidator(control: AbstractControl): {[key:string]: boolean} | null{
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password.pristine || confirmPassword.pristine){
      return null
    }

    return password && confirmPassword && password.value != confirmPassword.value ? {'misMatch': true} : null;
  }

  birthdayValidation(control: AbstractControl): {[key:string]: boolean} | null{
    const day = control.get('day');
    const month = control.get('month');
    const year = control.get('year');

    if (day.pristine || month.pristine || year.pristine){
      return null;
    }
    else{
      const dayValue = Number(day.value);
      const monthValue = month.value;
      const yearValue = Number(year.value);

      if (Date.parse(`${monthValue+1}/${dayValue}/${yearValue}`) && yearValue.toString().length === 4){
        const startingYear = new Date().getFullYear() - 70;
        const endingYear = new Date().getFullYear() - 16;
        
        if (yearValue < startingYear || yearValue > endingYear){
          if (yearValue > endingYear){
            return {'exceedAgeLimit': true};
          }
          else{
            return {'birthdayInvalid': true};
          }
        }
        
        const isLeapYear = true ? ((yearValue % 400 === 0) || (yearValue % 100 !== 0)) && ((yearValue % 4) == 0) : false;
        const monthEndDays = [31, (isLeapYear ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        if (dayValue > monthEndDays[monthValue]){
          return {'birthdayInvalid': true};
        }

        return null;
      }
      else{
        return {'birthdayInvalid': true};
      }
    }
  }

  async keyboardAction(hide=true){
    if (Capacitor.isNativePlatform()){
      if (hide){
        await Keyboard.hide();
      }
      else{
        await Keyboard.show();
      }
    }
  }

  async getLocation(user_gps=false){
    this.locationLoading = true;
    const result = await this.locationService.getLocation(user_gps);
    if (result != false){
      this.locationData = (result as LOCATION_JSON);
      this.signupForm.get('personalDetails.location').setValue(`${this.locationData.region.name}, ${this.locationData.country_code}`);
      this.locationLoading = false;
    }
    else{
      this.locationLoading = null;
      this.signupForm.get('personalDetails.location').setValue('Try Again!');
    }
  }

  getGender(event:Event){
    this.signupForm.get('personalDetails.gender').setValue((event as CustomEvent).detail.value);
  }

  stepperChanged(stepIndex){
    if (stepIndex === 0){
      if (this.locationData === null){
        this.getLocation();
      }
    }
  }

  getAllInterestCategory(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      this.graphqlService.graphqlQuery({query:ALL_INTEREST_CATEGORY}).valueChanges.pipe(take(1))
      .subscribe(
        (result:any) =>{
          if (result.data?.allInterestCategory?.edges?.length > 0){
            const all_interest_category:INTEREST_CATEGORY[] = [];
            result.data.allInterestCategory.edges.forEach(interest_category => {

              const interest_keyword_set:INTEREST_KEYWORD[] = [];
              interest_category.node.interestkeywordSet.edges.forEach(interest => {

                interest_keyword_set.push(
                  {
                    id:interest.node.id,
                    name:interest.node.word,
                    selected:false
                  }
                );
              });
              all_interest_category.push(
                {
                  name:interest_category.node.name,
                  interest_keyword:interest_keyword_set
                }
              );
            });

            this.interestCategory = all_interest_category;
            resolve(true);
          }
          else{
            resolve(false);
          }
        },
        error => resolve(false)
      );
    });
  }

  async stepperNext(stepper: MatStepper){
    if (stepper.selectedIndex === 1 && this.interestCategory.length === 0){
      this.loading = true;
      const getAllInterest = await this.getAllInterestCategory();

      if (getAllInterest){
        stepper.next();
      }
      else{
        this.ionicControllerService.simpleToast(ERROR_MESSAGE.unknown_error);
      }
      this.loading = false;
    }
    else{
      stepper.next();
    }
  }

  selectCategory(category:INTEREST_CATEGORY){
    this.selectedCategory = category;
    this.interestView = true;
  }

  selectInterest(interest:INTEREST_KEYWORD){
    if (interest.selected){
      interest.selected = false;

      if (this.interestSelectedCount > 0){
        this.interestSelectedCount--;
      }
    }
    else{
      interest.selected = true;
      this.interestSelectedCount++;
    }
  }

  async openBrowser(url:string){
    await Browser.open({url: url});
  }

  genderateDob(){
    console.log(this.signupForm.get('personalDetails.dob').value.toLocaleDateString());
    const day = Number(this.signupForm.get('personalDetails.dob').value.getDay());
    const monthIndex = Number(this.signupForm.get('personalDetails.dob').value.getMonth());
    const year = Number(this.signupForm.get('personalDetails.dob').value.getFullYear());

    return new Date(year, monthIndex, day).toLocaleDateString();
  }

  signupFormSubmit(stepper: MatStepper){
    this.loading = true;

    const selectedInterestId:string[] = [];
    this.interestCategory.forEach(category => {
      category.interest_keyword.forEach(interest => {
        if (interest.selected){
          selectedInterestId.push(interest.id);
        }
      });
    });

    const mutationArrgs = {
      username: this.signupForm.get('loginDetails.username').value,
      email: this.signupForm.get('loginDetails.email').value,
      password: this.signupForm.get('loginDetails.password').value,
      gender: this.signupForm.get('personalDetails.gender').value,
      dob: this.signupForm.get('personalDetails.dob').value.toLocaleDateString(),
      fullname: this.signupForm.get('personalDetails.fullname').value,
      nickname: this.signupForm.get('personalDetails.nickname').value,
      interests: selectedInterestId,
      locationJson: JSON.stringify(this.locationData),
    }

    this.graphqlService.graphqlMutation(USER_REGISTRATION, mutationArrgs).pipe(take(1))
    .subscribe(
      (result:any) => {
        if (result.data?.userRegistration?.result === true){
          stepper.next();
        }
        else{
          this.ionicControllerService.simpleToast(ERROR_MESSAGE.unknown_error);
        }

        this.loading = false;
      },
      error => {
        this.loading = false;
        this.ionicControllerService.simpleToast(ERROR_MESSAGE.unknown_error);
      }
    );
  }

  ionViewDidLeave(){
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    this.resetState();
    this.removeContent = true;
    this.createSignupForm();
  }

}
