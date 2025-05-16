import { Component, inject }           from '@angular/core';
import { CommonModule }                from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Observable, of }              from 'rxjs';
import { switchMap }                   from 'rxjs/operators';

import { BlogService } from '../../services/blog.service';
import { Blog }        from '../../models/blog';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.css'
})
export class BlogDetailComponent {
  private route = inject(ActivatedRoute);
  private svc   = inject(BlogService);

  blog$: Observable<Blog> = this.route.paramMap.pipe(
    switchMap(params => {
      const id = params.get('id');
      return id ? this.svc.getBlog(id) : of({} as Blog);
    })
  );
}
