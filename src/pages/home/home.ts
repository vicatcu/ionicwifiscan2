import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Diagnostic } from 'ionic-native';
import { Platform } from 'ionic-angular';

declare var WifiWizard: any;
declare var cordova: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  networkName: string;
  wifiAvailable: boolean = false;
  locationAvailable: boolean = false;
  scanResults: any = [];

  constructor(public navCtrl: NavController, public plt: Platform) {

  }

  openNativeSettings(){
    if(typeof cordova.plugins.settings.openSetting != undefined){
        cordova.plugins.settings.open(function(){
            console.log("opened settings")
        },
        function(){
            console.log("failed to open settings")
        });
    }
  }

  ionViewDidLoad(){
    this.plt.ready().then(() => {
      // Diagnostic.isLocationAuthorized()
      //   .then((authorized) => {
      //     console.log("isLocationAuthorized = ", authorized);
      //   })
      //   .then(() => {
      //     return Diagnostic.isLocationEnabled()
      //       .then((enabled) => {
      //         this.locationAvailable = enabled;
      //         console.log("isLocationEnabled = ", enabled);
      //       });
      //   });

      setInterval(() => {
        Diagnostic.isLocationEnabled()
          .then((enabled) => {
            this.locationAvailable = enabled;
            console.log("isLocationEnabled = ", enabled);
          });
        }, 1000);


      if(WifiWizard !== 'undefined'){
        console.log(WifiWizard)
      }
      else {
        console.warn('WifiWizard not loaded');
      }

      // check whether wifi is enabled once a second
      setInterval(() => {
        if(WifiWizard){
          let s = (status) => {
            this.wifiAvailable = status;
            if(!this.wifiAvailable){
              Diagnostic.setWifiState(true);
            }
          };
          let f = () => {
            this.wifiAvailable = false;
            Diagnostic.setWifiState(true);
          };
          WifiWizard.isWifiEnabled(s, f);
        }
      }, 1000);

      // check which network you are connected to once a second
      setInterval(() => {
        let ssidHandler = (ssid) => {
          console.log(ssid);
          this.networkName = ssid;
        }
        let fail = (error) => {
          this.networkName = null;
          console.log(error);
        }

        if(WifiWizard){
          WifiWizard.getCurrentSSID(ssidHandler, fail);
        }
      }, 1000);
    })
  }

  scan(){
    let success = () => {
      console.log("WiFi Scan Started Successfully");
    }

    let fail = (error) => {
      console.log("WiFi Scan Failed", error);
    }

    if(WifiWizard){
      WifiWizard.startScan(success, fail);
    }
  }

  checkResults(){
    let listHandler = (list) => {
        this.scanResults = list;
    };

    let fail = (e) => {
      this.scanResults = [];
    };

    if(WifiWizard){
      WifiWizard.getScanResults({}, listHandler, fail);
    }
  }

}
