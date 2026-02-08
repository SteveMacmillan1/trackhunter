import { Component } from '@angular/core';
import { faBookmark } from '@fortawesome/free-regular-svg-icons';
import { faBan } from '@fortawesome/free-solid-svg-icons';
import { faSquarePlus } from '@fortawesome/free-regular-svg-icons';
import { faSquareMinus, IconDefinition } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})

export class AboutComponent {
  bookmarkIcon: IconDefinition = faBookmark;
  banIcon: IconDefinition = faBan;
  expandIcon: IconDefinition = faSquarePlus;
  shrinkIcon: IconDefinition = faSquareMinus;
  icons: { [key: string]: IconDefinition } = {
    icon1: this.expandIcon,
    icon2: this.expandIcon,
    icon3: this.expandIcon
  }
  

  constructor() {}


  ngOnInit() {}


  public expandAnswer(id: Number): void {
    const answerDiv = document.getElementById('answer-div-' + id);
    if (!answerDiv)
      return;

    if (this.icons['icon' + id] == this.expandIcon)
      answerDiv.style.display = 'block';
    else
      answerDiv.style.display = 'none';

    // Invert the icon when clicked
    this.icons['icon' + id] = (this.icons['icon' + id] === this.expandIcon) ? this.shrinkIcon : this.expandIcon;
  }
}
