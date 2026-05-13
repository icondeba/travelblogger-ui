import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, map, of, startWith } from 'rxjs';
import { AboutService } from '../core/services/about.service';
import { MilestoneService } from '../core/services/milestone.service';
import { AboutContent } from '../core/models/about.model';
import { Milestone } from '../core/models/milestone.model';
import { LoadState } from '../core/models/load-state.model';

interface AboutHero {
  heading: string;
  paragraphs: string[];
  image: string;
}

interface AboutHeroState {
  status: 'loading' | 'success';
  data?: AboutHero;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  private aboutService = inject(AboutService);
  private milestoneService = inject(MilestoneService);

  isAarohanModalOpen = false;

  readonly aarohanLogo = 'assets/arohon.jpeg';
  readonly aarohanIntro = [
    'In his nearly three-decade-long life as an adventurer, Debasish has climbed countless peaks. He has written 21 books on expeditions and adventure, and made 13 films.',
    'Carried out Rescue Operations in Mountain, numerous Low and High-Altitude Trek, Coastal Trek, Jungle trek, Rock Climbing Courses, Nature Study Camp, Skiing like different types of Adventures, Cycle tours etc.',
    'Member of Sports Expert Panel of the Ministry of Youth Affairs & Sports, Government of India\'s Sports Experts Advisory Committee. President of Kreeda Bharati, Dakshin Banga.',
    'All India Assistant Coordinators of Central Board of Direct Taxes (CBDT) Adventure Committee.',
    'Governing Body Member of W.B. Mountaineering and Adventure Sports Foundation (WBM&SF). Coordinator in Mountain Rescue.',
    'Made an Audio Book - Everest Shirshe Bangali for Blind and Illiterate people. Numerous awards have come his way. He has received Arjuna in Mountaineering - the Tenzing Norgay National Adventure Award, the IMF Gold Medal, and many state and central honours. He has also been conferred an honorary doctorate for Youth Development, and earned the boundless love of countless admirers.',
    'By profession, he is a Joint Commissioner of Income Tax.'
  ];
  readonly aarohanHighlights = [
    'Regular motivational speaker in different Schools, Colleges, Universities and Academes, Clubs & seminars with audio visual sessions.',
    'Sending fund every month through Aarohan Trust to support education costs to five children, whose fathers were died in Mountain.',
    'Since 2012, organizing the Sarod Samman Awards under the name "Utkarshe Aarohan" on Durga Puja in Kolkata and Howrah town area.',
    'Formed a welfare group Iccharohan to serve the people in need.',
    'Attached with Blind Persons\' Association, Sopan, Durbar etc.'
  ];
  readonly aarohanWanderlust =
    'Formed an open group AAROHAN WANDERLUST, for adventure lovers and regularly organizes different adventure activities. Anybody may join. To join here please contact: Sandip Gharami 9830565654, Sourav Sinchan Mandal 9830618625, Malay Mukherjee 9748719352, Bivash Sarkar 9433395967.';

  private readonly fallbackHero: AboutHero = {
    heading: 'Decades of alpine leadership and storytelling.',
    paragraphs: [
      'Debasish is a professional mountaineer who blends expedition leadership with deep respect for local cultures and the fragile alpine ecosystem. From the Himalayas to the Andes, his focus remains the same: guide with clarity, climb with humility, and document the lessons of the mountain.',
      'His work spans summit expeditions, alpine training programs, and multimedia storytelling that empowers the next generation of climbers.'
    ],
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80'
  };

  aboutHeroState$ = this.aboutService.getAbout().pipe(
    map((about) => ({ status: 'success', data: this.toHero(about) } as AboutHeroState)),
    startWith({ status: 'loading' } as AboutHeroState),
    catchError(() => of({ status: 'success', data: this.fallbackHero } as AboutHeroState))
  );

  // Runs on SSR — milestones embedded in page HTML, browser gets them instantly
  milestonesState$ = this.milestoneService.getMilestones().pipe(
    map((data) => ({ status: 'success', data } as LoadState<Milestone[]>)),
    startWith({ status: 'loading' } as LoadState<Milestone[]>),
    catchError(() => of({ status: 'success', data: [] } as LoadState<Milestone[]>))
  );

  private toHero(about: AboutContent): AboutHero {
    const paragraphs = this.toParagraphs(about.content);
    return {
      heading: about.heading?.trim() || this.fallbackHero.heading,
      paragraphs: paragraphs.length > 0 ? paragraphs : this.fallbackHero.paragraphs,
      image: about.image?.trim() || this.fallbackHero.image
    };
  }

  private toParagraphs(content: string): string[] {
    if (!content?.trim()) return [];
    return content
      .replace(/\r\n/g, '\n')
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }

  openAarohanModal(): void {
    this.isAarohanModalOpen = true;
  }

  closeAarohanModal(): void {
    this.isAarohanModalOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeAarohanModal();
  }
}
