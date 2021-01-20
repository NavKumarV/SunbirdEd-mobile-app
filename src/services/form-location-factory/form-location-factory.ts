import { Injectable, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CachedItemRequestSourceFrom, LocationSearchCriteria, ProfileService } from '@project-sunbird/sunbird-sdk';
import { FieldConfigOptionsBuilder } from 'common-form-elements-v8';
import { defer, of } from 'rxjs';
import { CommonUtilService, TelemetryGeneratorService } from '@app/services';
import { Location as LocationType } from '@app/app/app.constant';
import { distinctUntilChanged, startWith, switchMap, tap } from 'rxjs/operators';
import { Location } from '@project-sunbird/client-services/models/location';
import { FieldConfig } from 'common-form-elements-v8';
@Injectable({ providedIn: 'root' })
export class FormLocationFactory {
  private userLocationCache: { [request: string]: Location[] | undefined } = {};
  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private commonUtilService: CommonUtilService,
    private telemetryGeneratorService: TelemetryGeneratorService,
  ) { }
  buildStateListClosure(config: FieldConfig<any>, initial = false): FieldConfigOptionsBuilder<Location> {
    return (formControl: FormControl, _: FormControl, notifyLoading, notifyLoaded) => {
      return defer(async () => {
        const req: LocationSearchCriteria = {
          from: CachedItemRequestSourceFrom.SERVER,
          filters: {
            type: LocationType.TYPE_STATE
          }
        };
        notifyLoading();
        return this.fetchUserLocation(req)
          .then((stateLocationList: Location[]) => {
            notifyLoaded();
            const list = stateLocationList.map((s) => ({ label: s.name, value: s }));
            if (config.default && initial) {
              const option = list.find((o) => o.value.id === config.default.id || o.label === config.default.name);
              formControl.patchValue(option ? option.value : null, { emitModelToViewChange: false });
              config.default['code'] = option ? option.value['code'] : config.default['code'];
            }
            initial = false;
            return list;
          })
          .catch((e) => {
            notifyLoaded();
            this.commonUtilService.showToast('NO_DATA_FOUND');
            console.error(e);
            return [];
          });
      });
    };
  }
  buildLocationListClosure(config: FieldConfig<any>, initial = false, profile?): FieldConfigOptionsBuilder<Location> {
    const locationType = config.templateOptions['dataSrc']['params']['id'];
    return (formControl: FormControl, contextFormControl: FormControl, notifyLoading, notifyLoaded) => {
      if (!contextFormControl) {
        return of([]);
      }
      return contextFormControl.valueChanges.pipe(
        startWith(contextFormControl.value),
        distinctUntilChanged((a: Location, b: Location) => {
          return !!(!a && !b ||
            !a && b ||
            !b && a ||
            a.code === b.code);
        }),
        tap(() => {
          if (formControl.value) {
            formControl.patchValue(null, { onlySelf: true, emitEvent: false });
          }
        }),
        switchMap(async (value) => {
          if (!value) {
            return [];
          }
          const req: LocationSearchCriteria = {
            from: CachedItemRequestSourceFrom.SERVER,
            filters: {
              type: locationType,
              parentId: (contextFormControl.value as Location).id
            }
          };
          notifyLoading();
          return await this.fetchUserLocation(req).then((locationList: Location[]) => {
            notifyLoaded();
            const list = locationList.map((s) => ({ label: s.name, value: s }));
            if (config.code === 'school' && initial && !formControl.value) {
              const option = list.find((o) => {
                return (profile.serverProfile ? profile.serverProfile.organisations : profile.organisations)
                .find((org) => org.orgName === o.label);
              });
              formControl.patchValue(option ? option.value : null, { emitModelToViewChange: false });
            } else if (config.default && initial && !formControl.value) {
              const option = list.find((o) => o.value.id === config.default.id);
              formControl.patchValue(option ? option.value : null);
              config.default['code'] = option ? option.value['code'] : config.default['code'];
            }
            return list;
          })
            .catch((e) => {
              notifyLoaded();
              this.commonUtilService.showToast('NO_DATA_FOUND');
              console.error(e);
              return [];
            });
        })
      );
    };
  }

  private async fetchUserLocation(request: any): Promise<Location[]> {
    const serialized = JSON.stringify(request);
    if (this.userLocationCache[serialized]) {
      return this.userLocationCache[serialized];
    }
    return this.profileService.searchLocation(request).toPromise()
      .then((response) => {
        this.userLocationCache[serialized] = response;
        return response;
      });
  }
  // private generateTelemetryInteract(telemetryData) {
  //   this.telemetryGeneratorService.generateInteractTelemetry(
  //     telemetryData.type,
  //     telemetryData.subType,
  //     telemetryData.env,
  //     telemetryData.pageId,
  //     undefined,
  //     undefined,
  //     undefined,
  //     undefined,
  //     telemetryData.id
  //   );
  // }
}
