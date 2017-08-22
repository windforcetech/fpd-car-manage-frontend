import { Component, OnInit, AfterContentInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

// 服务
import { VehicleOffLineService } from '../vehicle-off-line.service';
import { EventsService } from '../../../../services/events-service.service';


// 动画
import { fadeIn } from '../../../../animation/fadeIn';
import { bounceIn } from '../../../../animation/bounceIn';


// 表格基类
import { MitDataTableBase } from '../../../../widgets/mit-data-table/mit-data-table-base';
@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  animations: [fadeIn, bounceIn]
})
export class ListComponent extends MitDataTableBase implements OnInit, OnDestroy {
  public KeyValue: any;
  public OID: any;
  public ODID: any;
  public OffLineTime: any;
  public _getList_: any;
  public _download: any;
  // 离线范围下拉框
  public placeholder = '请选择离线范围';
  public optionName = "DictionaryValue";
  public optionList: Array<any>;

  public text: any;
  public isModal: boolean = false;
  constructor(private eventsService: EventsService,
    private vehicleOffLineService: VehicleOffLineService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
    super(router, activatedRoute);
  }

  ngOnInit() { 
    this.getOffLineEnum();
  }

  // 选择公司
  selectCompany(e){
    this.OID = e[0];
    this.ODID = e.length > 1 ? e[e.length -1] : -1;
  }

  // 获取状态
  getStatus(e){
    this.OffLineTime = e.ID;
  }

  search(KeyValue) {
    this.rows = [];
    this.query = {
      KeyValue: KeyValue,
      OID: this.OID,
      ODID: this.ODID,
      OffLineTime: this.OffLineTime,
      PageIndex: 1,
      PageSize: 10,
      IsSearchTotal: true
    };
    this.getList();
    this.text = '查询中...';
    this.isModal = true;
  }

  getList() {
    this._getList_ = this.vehicleOffLineService.OffLineSummary(this.query).subscribe(
      (res) => {
        if (res.State) {
          this.rows.push({ pageNum: this.query.PageIndex, data: res.Data.CurrentData });
          if (this.query.IsSearchTotal) {
            this.totalCount = res.Data.TotalCount;
          }
          this.getLocalData();
        }
        this.text = '';
        this.isModal = false;
      },
      (err) => {
        if (err.State == 10 || err.State == 11 || err.State == 12) {
          this.eventsService.emitMessageEvent(err.State == 1 ? this.eventsService.eventNames.EVENT_TOAST_SUCCESS : this.eventsService.eventNames.EVENT_TOAST_ERROR, err.Message);
          setTimeout(() => {
            this.router.navigate(['/account/login']);
          }, 2500)
        } else {
          this.eventsService.emitMessageEvent(err.State == 1 ? this.eventsService.eventNames.EVENT_TOAST_SUCCESS : this.eventsService.eventNames.EVENT_TOAST_ERROR, '网络异常!');
        }
        this.text = '';
        this.isModal = false;
      }
    );
  }

  // 获取离线范围枚举
  getOffLineEnum(){
    this.vehicleOffLineService.OffLineEnum().subscribe((res)=>{
      if(res.State){
        const data = res.Data;
        data.unshift({
          ID: -1,
          DictionaryValue: '全部',
          DictionaryCategory: "离线时间段"
        })
        this.optionList = data;
      }
    },(err)=>{
      if (err.State == 10 || err.State == 11 || err.State == 12) {
          this.eventsService.emitMessageEvent(err.State == 1 ? this.eventsService.eventNames.EVENT_TOAST_SUCCESS : this.eventsService.eventNames.EVENT_TOAST_ERROR, err.Message);
          setTimeout(() => {
            this.router.navigate(['/account/login']);
          }, 2500)
        } else {
          this.eventsService.emitMessageEvent(err.State == 1 ? this.eventsService.eventNames.EVENT_TOAST_SUCCESS : this.eventsService.eventNames.EVENT_TOAST_ERROR, '网络异常!');
        }
    })
  }

  // 导出
  download(KeyValue) {
    const data = {
      KeyValue: KeyValue || '',
      OID: this.OID || -1,
      ODID: this.ODID || -1,
      OffLineTime: this.OffLineTime
    }
    this.text = '导出中...';
    this.isModal = true;
    this._download = this.vehicleOffLineService.OfflineSummaryExcel(data).subscribe((res) => {
      const blob = new Blob([res], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});  
      const objectUrl = URL.createObjectURL(blob); 
      if (window.navigator.msSaveOrOpenBlob) {
        navigator.msSaveBlob(blob, '车辆离线统计报表');
      } else {
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.setAttribute('style', 'display:none');
        a.setAttribute('href', objectUrl);
        a.setAttribute('download','车辆离线统计报表');
        a.click();
        URL.revokeObjectURL(objectUrl);
      }
      this.text = '';
      this.isModal = false;
    }, (err) => {
      if (err.State == 10 || err.State == 11 || err.State == 12) {
        this.eventsService.emitMessageEvent(err.State == 1 ? this.eventsService.eventNames.EVENT_TOAST_SUCCESS : this.eventsService.eventNames.EVENT_TOAST_ERROR, err.Message);
        setTimeout(() => {
          this.router.navigate(['/account/login']);
        }, 2500)
      } else {
        this.eventsService.emitMessageEvent(err.State == 1 ? this.eventsService.eventNames.EVENT_TOAST_SUCCESS : this.eventsService.eventNames.EVENT_TOAST_ERROR, '网络异常!');
      }
      this.text = '';
      this.isModal = false;
    });
  }

  // 修改
  detail(item: any): void {
    this.router.navigate(['./detail', item.VID], { relativeTo: this.activatedRoute });
  }

  ngOnDestroy() {
    this.rows = [];
    this.list = [];
    if (this._getList_) {
      this._getList_.unsubscribe();
    }
    if (this._download) {
      this._download.unsubscribe();
    }
  }
}