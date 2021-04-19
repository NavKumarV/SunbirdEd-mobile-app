import { Component, Input, OnInit } from '@angular/core';
import { LoaderService, ToastService, UtilsService } from '@app/app/manage-learn/core';
import { UnnatiDataService } from '@app/app/manage-learn/core/services/unnati-data.service';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { File } from '@ionic-native/file/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { AlertController, Platform, PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { FileOpener } from '@ionic-native/file-opener/ngx';

@Component({
  selector: 'download-share',
  templateUrl: './download-share.component.html',
  styleUrls: ['./download-share.component.scss'],
})
export class DownloadShareComponent implements OnInit {
  @Input() interface;
  @Input() showOptions;
  @Input() name;
  @Input() extension: string;
  @Input() downloadUrl: any;
  texts: any;
  constructor(
    public popoverController: PopoverController,
    private socialSharing: SocialSharing,
    private fileTransfer: FileTransfer,
    private platform: Platform,
    private file: File,
    public alertController: AlertController,
    public utils: UtilsService,
    public toast: ToastService,
    public loader: LoaderService,
    public filePath: FilePath,
    public unnatiSrvc: UnnatiDataService,
    private translate: TranslateService,
    private androidPermissions: AndroidPermissions,
    public fileOpener: FileOpener,
  ) {
    this.translate.get(['FRMELEMENTS_MSG_ERROR_WHILE_DOWNLOADING', 'FRMELEMENTS_MSG_SUCCESSFULLY DOWNLOADED']).subscribe((data) => {
      this.texts = data;
    });
  }

  ngOnInit() { }
  async openPopupMenu(ev) {
    const popover = await this.popoverController.create({
      component: DownloadShareComponent,
      componentProps: {
        showOptions: true,
        interface: 'simple',
        name: this.name,
        extension: this.extension,
        downloadUrl: this.downloadUrl,
      },
      event: ev,
      translucent: true,
    });
    return await popover.present();
  }

  async download(share?) {
    this.loader.startLoader();

    let config = { url: this.downloadUrl };

    let res = await this.unnatiSrvc.get(config).toPromise();

    if (res.result && !res.result.data && !res.result.data.downloadUrl) {
      this.toast.showMessage(this.texts['FRMELEMENTS_MSG_ERROR_WHILE_DOWNLOADING'], 'danger');
      this.loader.stopLoader();
      return;
    }

    let fileName = this.utils.generateFileName(this.name);
    fileName = fileName + this.extension;

    const ft = this.fileTransfer.create();
    ft.download(res.result.data.downloadUrl, this.directoryPath() + fileName)
      .then(
        (res) => {
          // this.toast.showMessage(this.texts['FRMELEMENTS_MSG_SUCCESSFULLY DOWNLOADED'])
          share ? this.share(res.nativeURL) : this.openFile(res);
        },
        (err) => {
          console.log(err);
          this.toast.showMessage(this.texts['FRMELEMENTS_MSG_ERROR_WHILE_DOWNLOADING'], 'danger');
          this.requestPermission();
        }
      )
      .finally(() => {
        this.interface == 'simple' ? this.popoverController.dismiss() : null; // close the overlay for Simple UI
        this.loader.stopLoader();
      });
  }

  requestPermission() {
    if (this.platform.is('android')) {
      this.androidPermissions.requestPermissions([
        this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
        this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE,
      ]);
    }
  }

  share(path) {
    this.socialSharing.share(null, null, path, null);
  }

  directoryPath(): string {
    let dir_name = 'Download/';
    if (this.platform.is('ios')) {
      return this.file.documentsDirectory + dir_name;
    } else {
      return this.file.externalRootDirectory + dir_name;
    }
  }
  openFile(res) {
    this.fileOpener.open(res.nativeURL, 'application/pdf')
      .then(() => { console.log('File is opened'); })
      .catch(e => console.log('Error opening file', e));
  }
}