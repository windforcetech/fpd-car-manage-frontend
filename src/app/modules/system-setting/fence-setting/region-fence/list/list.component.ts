import { Component, OnInit, AfterContentInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

// 动画
import { fadeIn } from '../../../../../animation/fadeIn';
import { bounceIn } from '../../../../../animation/bounceIn';

// 服务
import { RegionFenceService } from '../region-fence.service';
import { EventsService } from '../../../../../services/events-service.service';

// 表格基类
import { MitDataTableBase } from '../../../../../widgets/mit-data-table/mit-data-table-base';



@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  animations: [fadeIn, bounceIn]
})
export class ListComponent extends MitDataTableBase implements OnInit, OnDestroy {

  public getRenderList: any;

  public showAlert = false;

  public currentItem: any;
  public FenceName: any;
  public text: any;
  public isModal: boolean = false;
  constructor(
    private regionFenceService: RegionFenceService,
    private eventsService: EventsService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
    super(router, activatedRoute);
  }

  ngOnInit() {
  }


  // 查询
  search(FenceName) {
    this.rows = [];
    this.query = {
      FenceName: FenceName ? FenceName.trim() : '',
      PageIndex: 1,
      PageSize: 10,
      IsSearchTotal: true
    };
    this.getList();
    this.text = '查询中...';
    this.isModal = true;
  }


  // 获取所有数据
  getList() {
    this.getRenderList = this.regionFenceService.GetPageAreaFenceRuleList(this.query).subscribe(
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

  // 更新状态
  updataStatus(FenceId, Status) {
    const data = { FenceId: FenceId, Status: Status ? 1 : 0 };
    this.regionFenceService.UpdateFenceStatus(data).subscribe((res) => {
      this.eventsService.emitMessageEvent(res.State === 1 ? this.eventsService.eventNames.EVENT_TOAST_SUCCESS : this.eventsService.eventNames.EVENT_TOAST_ERROR, res.Message);
    }, (err) => {
      this.eventsService.emitMessageEvent(err.State === 1 ? this.eventsService.eventNames.EVENT_TOAST_SUCCESS : this.eventsService.eventNames.EVENT_TOAST_ERROR, err.Message);
    });
  }


  // 删除弹窗
  delete(item): void {
    this.showAlert = true;
    this.currentItem = item;
  }

  // 弹窗关闭
  closeAlert(e) {
    this.showAlert = false;
    if (e) {
      const data = { FenceId: e.ID };
      this.regionFenceService.DeleteFence(data).subscribe((res) => {
        this.eventsService.emitMessageEvent(res.State === 1 ? this.eventsService.eventNames.EVENT_TOAST_SUCCESS : this.eventsService.eventNames.EVENT_TOAST_ERROR, res.Message);
        this.rows = [];
        this.list = [];
        this.getList();
      });
    }


  }


  // 销毁
  ngOnDestroy() {
    if(this.getRenderList){
       this.getRenderList.unsubscribe();
    }
    this.rows = [];
    this.list = [];
  }

}
