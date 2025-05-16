import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogService } from '../../services/blog.service';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule }  from '@angular/material/icon';
import { MatButtonModule }from '@angular/material/button';
import { RouterModule }   from '@angular/router';
import { Observable }     from 'rxjs';
import { Blog }           from '../../models/blog';

@Component({
  selector: 'app-admin-blog-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatButtonModule, RouterModule],
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.css',
})
export class AdminBlogListComponent {
  blogs$: Observable<Blog[]>;
  cols = ['title','createdAt','actions'];
  constructor(private svc: BlogService) {
    this.blogs$ = this.svc.getBlogs();
  }
  del(id: string) {
    if (confirm('Silinsin mi?')) this.svc.deleteBlog(id);
  }
}
