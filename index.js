function main() {
  var manager = new SlideManager($('section')).init();
}

const EVENTS = {
  click: 'click'
}

class SlideManager {
  constructor(slides) {
    this.slides = slides;
    this.current = -1;
    this.isShowAll = false;
    
    this.next = this.next.bind(this);
    this.prev = this.prev.bind(this);
    this.showAll = this.showAll.bind(this);
    this.destroy =  this.destroy.bind(this);
  }
  init() {
    // event handlers
    var { click } = EVENTS;
    $('#next').on(click, this.next);
    $('#prev').on(click, this.prev);
    $('#all').on(click, this.showAll);

    // show 1st slide
    this.next();
    
    return this;
  }
  move(index) {
    if (this.slides.length === 0) {
      return;
    }
    
    var len = this.slides.length;
    if (index >= len) {
      index = 0;
    }
    if (index < 0) {
      index = len - 1;
    }
    
    this.current = index;
    this.slides.hide();
    this.slides.eq(this.current).show();
    
    this.isShowAll = false;
    
    return this;
  }
  next() {
    this.move(this.current + 1);
    
    return this;
  }
  prev() {
    this.move(this.current - 1);
    
    return this;
  }
  showAll() {
    if (this.isShowAll) {
      this.move(this.current);
    } else {
      this.slides.show();
      this.isShowAll = true;
    }
    return this;
  }
  
  destroy() {
    this.slides = [];
    this.current = -1;
    this.isShowAll = false;
        
    // event handlers
    var { click } = EVENTS;
    $('#next').off(click, this.next);
    $('#prev').off(click, this.prev);
    $('#all').off(click, this.showAll);
    
  }
}

main();
