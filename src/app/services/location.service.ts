import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { take } from 'rxjs/operators';
import { GET_LOCATION_FROM_IP } from '../helpers/graphql.query';
import { COORDINATE, LOCATION_JSON } from '../helpers/models';
import { GraphqlService } from './graphql.service';
import { Geolocation } from '@capacitor/geolocation';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';
import {Capacitor} from "@capacitor/core";

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(
    private http: HttpClient,
    private graphqlService: GraphqlService,
    private locationAccuracy: LocationAccuracy
  ) { }

  private coordinate:COORDINATE;
  private location:LOCATION_JSON = {
    postal_code:null,
    region:{
      name:null,
      city:false,
      town:false,
      village:false,
      hamlet:false,
      unknown:false
    },
    coordinate:null,
    state:null,
    country_code:null
  };

  private turnOnGPS(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      if (Capacitor.isNativePlatform()){
        this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY)
        .then(() => resolve(true), err => resolve(true))
        .catch(err => resolve(true))
      }
      else{
        resolve(true);
      }
    });
  }

  private getCoordinate(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      Geolocation.getCurrentPosition()
      .then(position => {
        this.coordinate = {
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        }
        resolve(true);
      })
      .catch(err => resolve(false));
    });

  }

  private getLocationFromCoordinate(latitude:string,longitude:string): Promise<boolean|LOCATION_JSON>{
    return new Promise<boolean|LOCATION_JSON>((resolve, reject) => {
      this.http.get('https://nominatim.openstreetmap.org/reverse?format=jsonv2&accept-language=en&zoom=14&lat='+latitude+'&lon='+longitude).pipe(take(1))
      .subscribe(
        (result:any) =>{
          const address = result.address;
          if (address.hamlet){
            this.location.region.name = address.hamlet;
            this.location.region.hamlet = true;
          }
          else if (address.village){
            this.location.region.name = address.village;
            this.location.region.village = true;
          }
          else if (address.town){
            this.location.region.name = address.town;
            this.location.region.town = true;
          }
          else if (address.city){
            this.location.region.name = address.city;
            this.location.region.city = true;
          }
          else if (address.suburb){
            this.location.region.name = address.suburb;
            this.location.region.unknown = true;
          }
          else if (address.municipality){
            this.location.region.name = address.municipality;
            this.location.region.unknown = true;
          }
          else if (address.district){
            this.location.region.name = address.district;
            this.location.region.unknown = true;
          }
          else if (address.county){
            this.location.region.name = address.county;
            this.location.region.unknown = true;
          }

          if (address.state){
            this.location.state = address.state;
          }
          else if (address.province){
            this.location.state = address.province;
          }
          else{
            this.location.state = this.location.region.name;
          }

          this.location.country_code = address.country_code.toUpperCase();
          this.location.coordinate = {
            latitude:latitude,
            longitude: longitude
          }

          if (this.location.state != null && this.location.country_code){
            resolve(this.location);
          }
          else{
            resolve(false);
          }
        },
        error =>{
          resolve(false);
        }
      );
    });
  }

  private getLocationFromIP(){
    return this.graphqlService.graphqlMutation(GET_LOCATION_FROM_IP);
  }

  private getLocationFromPincode(pincode:string,country_code:string){
    return this.http.get('https://api.worldpostallocations.com/pincode?postalcode='+pincode+'&countrycode='+country_code);
  }

  getLocation(access_gps=false): Promise<boolean|LOCATION_JSON>{
    return new Promise<boolean|LOCATION_JSON>((resolve, reject) => {
      Geolocation.checkPermissions()
      .then(PermissionStatus => {
        if (PermissionStatus.coarseLocation == 'granted') {
          (async () => {
            await this.turnOnGPS();
            const coordinateResult = await this.getCoordinate();

            if (coordinateResult){
              const result = await this.getLocationFromCoordinate(
                this.coordinate.latitude.toString(), this.coordinate.longitude.toString()
              );
              resolve(result);
            }
            else{
              resolve(coordinateResult);
            }

          })();
        }
        else if (access_gps === true) {
          (async () => {
            await this.turnOnGPS();
            const coordinateResult = await this.getCoordinate();

            if (coordinateResult){
              const result = await this.getLocationFromCoordinate(
                this.coordinate.latitude.toString(), this.coordinate.longitude.toString()
              );
              resolve(result);
            }
            else{
              resolve(coordinateResult);
            }

          })();
        }
        else {
          this.getLocationFromIP().pipe(take(1))
          .subscribe(
              (geo_location:any) =>{
              (async () => {
                const coordinate = geo_location.data.getLocationFromIp;
                if (coordinate.latitude === null || coordinate.longitude === null){
                  resolve(false);
                }
                else{
                  const result = await this.getLocationFromCoordinate(coordinate.latitude, coordinate.longitude);
                  resolve(result);
                }
              })();
            },
            error =>{
              resolve(false);
            }
          );
        }
      })
      .catch(err => resolve(false));
    });
  }
}
