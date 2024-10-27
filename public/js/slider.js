const left = document.querySelector('.arrow-left');
const right = document.querySelector('.arrow-right');
const slider = document.querySelector('.main-slider');
const images = document.querySelectorAll('.image');

let slideNumber = 1;
const length = images.length;

right.addEventListener('click', ()=> {
if(slideNumber < length ){
    slider.style.transform = `translateX(-${slideNumber*2038}px)`;
    slideNumber++;
}
else {
    slider.style.transform = `translateX(0px)`;
    slideNumber = 1;
}

})

left.addEventListener('click', ()=> {
    if(slideNumber > 1 ){
        slider.style.transform = `translateX(-${(slideNumber-2)*2038}px)`;
        slideNumber--;
    }
    else {
        slider.style.transform = `translateX(-${(length-1)*2038}px)`;
        slideNumber = length;
    }
    
    })

let slideInterval ;

const startSlideShow = () =>{
    slideInterval = setInterval(()=>{
        if(slideNumber < length ){
            slider.style.transform = `translateX(-${slideNumber*2038}px)`;
            slideNumber++;
        }
        else {
            slider.style.transform = `translateX(0px)`;
            slideNumber = 1;
        }
    },3000);
};

startSlideShow();

const stopSlideShow = () =>{
  clearInterval(slideInterval);
}

slider.addEventListener('mouseover', stopSlideShow);
slider.addEventListener('mouseout', startSlideShow);
right.addEventListener('mouseover', stopSlideShow);
right.addEventListener('mouseout', startSlideShow);
left.addEventListener('mouseover', stopSlideShow);
left.addEventListener('mouseout', startSlideShow);
