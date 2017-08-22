import { Component, OnInit, AfterContentInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

// 服务
import { ElectricFenceService } from '../electric-fence.service';
import { EventsService } from '../../../../../services/events-service.service';

// 动画
import { fadeIn } from '../../../../../animation/fadeIn';
import { bounceIn } from '../../../../../animation/bounceIn';

// 表格基类
import { MitDataTableBase } from './../../../../../widgets/mit-data-table/mit-data-table-base';

// 管道
import { TransDatePipe } from '../../../../../widgets/mit-pipe/TransDate/trans-date.pipe';


@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  animations: [fadeIn, bounceIn]
})
export class ListComponent extends MitDataTableBase implements OnInit, OnDestroy {
  public OID: any;
  public ODID: any;
  public nowDate: any;
  public startTime: any;
  public KeyValue: any;
  public endTime: any;
  public _getList:any;
  public _download: any;
  public text: any;
  public isModal: boolean = false;
  constructor(
    private electricFenceService: ElectricFenceService,
    private eventsService: EventsService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    super(router, activatedRoute);
  }

  ngOnInit() {
    this.getNow();
  }

  getNow() {
    const _now = new Date();
    this.nowDate = { year: _now.getFullYear(), month: _now.getMonth() + 1, day: _now.getDate() };
  }

  // 选择公司
  selectCompany(e){
    this.OID = e[0];
    this.ODID = e.length > 1 ? e[e.length -1] : -1;
  }

  // 查询
  search(KeyValue, startTime, endTime) {
    this.rows = [];
    this.query = {
      OID: this.OID,
      ODID: this.ODID,
      KeyValue: KeyValue ? KeyValue.trim() : '',
      StartDate: new TransDatePipe().transform(startTime),
      EndDate: new TransDatePipe().transform(endTime),
      PageIndex: 1,
      PageSize: 10,
      IsSearchTotal: true
    };
    this.getList();
    this.text = '查询中...';
    this.isModal = true;
  }


  // 详情
  detail(item: any): void {
    this.router.navigateByUrl('page/intelligent-operating/driving-data/track-detail/' + item.TrackId);
  }

  // 获取所有数据
  getList() {
    this._getList = this.electricFenceService.GetPageElctDataList(this.query).subscribe(
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
        this.text = '';
        this.isModal = false;
        if (err.State == 10 || err.State == 11 || err.State == 12) {
          this.eventsService.emitMessageEvent(err.State == 1 ? this.eventsService.eventNames.EVENT_TOAST_SUCCESS : this.eventsService.eventNames.EVENT_TOAST_ERROR, err.Message);
          setTimeout(() => {
            this.router.navigate(['/account/login']);
          }, 2500)
        } else {
          this.eventsService.emitMessageEvent(err.State == 1 ? this.eventsService.eventNames.EVENT_TOAST_SUCCESS : this.eventsService.eventNames.EVENT_TOAST_ERROR, '网络异常!');
        }
      }
    );
  }

  // 导出
  download(KeyValue, startTime, endTime) {
    const data = {
      OID: this.OID || -1,
      ODID: this.ODID || -1,
      KeyValue: KeyValue ? KeyValue.trim() : '',
      StartDate: new TransDatePipe().transform(startTime),
      EndDate: new TransDatePipe().transform(endTime)
    };
    this.text = '导出中...';
    this.isModal = true;
    this._download = this.electricFenceService.GetPageElctDataListForExport(data).subscribe((res) => {
      const blob = new Blob([res], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});  
      const objectUrl = URL.createObjectURL(blob); 
      if (window.navigator.msSaveOrOpenBlob) {
        navigator.msSaveBlob(blob, '电子围栏列表');
      } else {
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.setAttribute('style', 'display:none');
        a.setAttribute('href', objectUrl);
        a.setAttribute('download','电子围栏列表');
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

  // 销毁
  ngOnDestroy() {
    if(this._getList){
      this._getList.unsubscribe();
    }
    if(this._download){
      this._download.unsubscribe();
    }
    this.rows = [];
    this.list = [];
  }
}
