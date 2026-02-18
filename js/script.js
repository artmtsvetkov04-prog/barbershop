document.addEventListener('DOMContentLoaded', function() {
  // ===== Маска телефона =====
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
      let x = e.target.value.replace(/\D/g, '').match(/(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
      e.target.value = !x[2] ? x[1] : '+7 (' + x[2] + (x[3] ? ') ' + x[3] : '') + (x[4] ? '-' + x[4] : '') + (x[5] ? '-' + x[5] : '');
    });
  }

  // ===== Плавная прокрутка по якорям =====
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
        // Закрываем мобильное меню, если открыто
        const nav = document.querySelector('.nav');
        const headerContacts = document.querySelector('.header-contacts');
        if (window.innerWidth <= 768) {
          nav.style.display = 'none';
          headerContacts.style.display = 'none';
        }
      }
    });
  });

  // ===== Мобильное меню =====
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const nav = document.querySelector('.nav');
  const headerContacts = document.querySelector('.header-contacts');
  if (mobileBtn) {
    mobileBtn.addEventListener('click', () => {
      if (nav.style.display === 'flex') {
        nav.style.display = 'none';
        headerContacts.style.display = 'none';
      } else {
        nav.style.display = 'flex';
        headerContacts.style.display = 'flex';
        nav.style.flexDirection = 'column';
        nav.style.position = 'absolute';
        nav.style.top = '80px';
        nav.style.left = '0';
        nav.style.width = '100%';
        nav.style.background = 'rgba(255, 243, 233, 0.95)';
        nav.style.padding = '20px';
        nav.style.backdropFilter = 'blur(10px)';
        headerContacts.style.position = 'absolute';
        headerContacts.style.top = '250px';
        headerContacts.style.left = '20px';
        headerContacts.style.flexDirection = 'column';
      }
    });
  }

  // ===== Анимация счётчиков (stats) =====
  const statNumbers = document.querySelectorAll('.stat-number');
  let animated = false;

  function animateStats() {
    if (animated) return;
    const statsSection = document.querySelector('.stats');
    if (!statsSection) return;
    const rect = statsSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    if (rect.top < windowHeight - 100) {
      statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'), 10);
        let current = 0;
        const increment = target / 60; // за 60 кадров (примерно 1 сек при 60fps)
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            stat.textContent = target;
            clearInterval(timer);
          } else {
            stat.textContent = Math.floor(current);
          }
        }, 16); // ~60fps
      });
      animated = true;
    }
  }

  window.addEventListener('scroll', animateStats);
  animateStats();

  // ===== Карусель отзывов =====
  const reviews = document.querySelectorAll('.review-card');
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');
  let currentReview = 0;

  function showReview(index) {
    reviews.forEach((review, i) => {
      review.classList.toggle('active', i === index);
    });
  }

  if (prevBtn && nextBtn && reviews.length) {
    prevBtn.addEventListener('click', () => {
      currentReview = (currentReview - 1 + reviews.length) % reviews.length;
      showReview(currentReview);
    });
    nextBtn.addEventListener('click', () => {
      currentReview = (currentReview + 1) % reviews.length;
      showReview(currentReview);
    });
    // Автоматическая смена каждые 5 секунд
    setInterval(() => {
      currentReview = (currentReview + 1) % reviews.length;
      showReview(currentReview);
    }, 5000);
  }

  // ===== Параллакс для hero =====
  window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    if (hero) {
      const scrolled = window.pageYOffset;
      hero.style.backgroundPositionY = `${scrolled * 0.5}px`;
    }
  });

  // ===== Анимация появления элементов при прокрутке (fade-in) =====
  const fadeElements = document.querySelectorAll('.section, .master-card, .service-card, .advantage-card, .portfolio-item, .review-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  fadeElements.forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
  });

  // ===== Обработка отправки формы в Google Sheets =====
  const form = document.getElementById('booking-form');
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();

      // Валидация
      const name = document.getElementById('name').value.trim();
      const phone = document.getElementById('phone').value.trim();
      if (!name || !phone) {
        showNotification('Пожалуйста, заполните имя и телефон', false);
        return;
      }

      // Собираем данные
      const formData = {
        name: name,
        phone: phone,
        master: document.getElementById('master').value,
        service: document.getElementById('service').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        comment: document.getElementById('comment')?.value || ''
      };

      // URL вашего Google Apps Script (ЗАМЕНИТЕ НА СВОЙ)
      const scriptURL = 'https://script.google.com/macros/s/AKfycby15nnjo3b9Pc64hGLLpQfGXFKQ6NP6H1B-2Fa1vzM9GKCBQYLR7w2yp5mDSvigrcENkA/exec';

      try {
        const response = await fetch(scriptURL, {
          method: 'POST',
          mode: 'no-cors', // важно для Google Apps Script
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });

        // Показываем уведомление об успехе
        showNotification('Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.');
        form.reset(); // очищаем форму
      } catch (error) {
        console.error('Ошибка:', error);
        showNotification('Произошла ошибка, попробуйте позже или позвоните нам.', false);
      }
    });
  }

  // Функция показа уведомления
  function showNotification(message, success = true) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = 'notification' + (success ? '' : ' error');
    notification.classList.add('show');
    setTimeout(() => {
      notification.classList.remove('show');
    }, 4000);
  }
});
// ===== Кастомный календарь =====
const customDateInput = document.getElementById('customDateInput');
const calendarPopup = document.getElementById('calendarPopup');
const calendarMonthYear = document.getElementById('calendarMonthYear');
const calendarDays = document.getElementById('calendarDays');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const todayBtn = document.getElementById('todayBtn');
const clearBtn = document.getElementById('clearBtn');
const dateHidden = document.getElementById('date');
const datePlaceholder = document.querySelector('.date-placeholder');

let currentDate = new Date();
let selectedDate = null;

function renderCalendar(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Пн=0, Вс=6

  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  calendarMonthYear.textContent = `${monthNames[month]} ${year}`;

  let daysHtml = '';
  for (let i = 0; i < startDayOfWeek; i++) {
    daysHtml += '<div class="calendar-day empty"></div>';
  }

  const today = new Date();
  for (let d = 1; d <= daysInMonth; d++) {
    const dayDate = new Date(year, month, d);
    const isToday = dayDate.toDateString() === today.toDateString();
    const isSelected = selectedDate && dayDate.toDateString() === selectedDate.toDateString();
    daysHtml += `<div class="calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" data-day="${d}">${d}</div>`;
  }

  calendarDays.innerHTML = daysHtml;

  // Добавляем обработчики на дни
  document.querySelectorAll('.calendar-day:not(.empty)').forEach(day => {
    day.addEventListener('click', () => {
      const dayVal = day.dataset.day;
      selectedDate = new Date(year, month, dayVal);
      dateHidden.value = formatDate(selectedDate);
      datePlaceholder.textContent = formatDate(selectedDate, true);
      calendarPopup.classList.remove('active');
      // Убираем выделение у других
      document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
      day.classList.add('selected');
    });
  });
}

function formatDate(date, forDisplay = false) {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return forDisplay ? `${d}.${m}.${y}` : `${y}-${m}-${d}`;
}

customDateInput.addEventListener('click', (e) => {
  e.stopPropagation();
  calendarPopup.classList.toggle('active');
  timePopup?.classList.remove('active');
  renderCalendar(currentDate);
});

prevMonthBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(currentDate);
});

nextMonthBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(currentDate);
});

todayBtn.addEventListener('click', () => {
  selectedDate = new Date();
  dateHidden.value = formatDate(selectedDate);
  datePlaceholder.textContent = formatDate(selectedDate, true);
  calendarPopup.classList.remove('active');
  renderCalendar(selectedDate);
});

clearBtn.addEventListener('click', () => {
  selectedDate = null;
  dateHidden.value = '';
  datePlaceholder.textContent = 'Выберите дату';
  calendarPopup.classList.remove('active');
  renderCalendar(currentDate);
});

// Закрыть календарь при клике вне его
document.addEventListener('click', (e) => {
  if (!customDateInput.contains(e.target) && !calendarPopup.contains(e.target)) {
    calendarPopup.classList.remove('active');
  }
  if (customTimeInput && !customTimeInput.contains(e.target) && !timePopup.contains(e.target)) {
    timePopup.classList.remove('active');
  }
});

// ===== Кастомный выбор времени =====
const customTimeInput = document.getElementById('customTimeInput');
const timePopup = document.getElementById('timePopup');
const timeHidden = document.getElementById('time');
const timePlaceholder = document.querySelector('.time-placeholder');
const timeGrid = document.querySelector('.time-grid');

// Генерируем временные слоты с 10:00 до 20:00 с шагом 30 минут
const timeSlots = [];
for (let h = 10; h <= 20; h++) {
  for (let m = 0; m < 60; m += 30) {
    if (h === 20 && m > 0) continue; // до 20:00 включительно
    const hour = h.toString().padStart(2, '0');
    const minute = m.toString().padStart(2, '0');
    timeSlots.push(`${hour}:${minute}`);
  }
}

// Заполняем сетку
timeSlots.forEach(slot => {
  const btn = document.createElement('div');
  btn.classList.add('time-slot');
  btn.textContent = slot;
  btn.dataset.time = slot;
  timeGrid.appendChild(btn);
});

customTimeInput.addEventListener('click', (e) => {
  e.stopPropagation();
  timePopup.classList.toggle('active');
  calendarPopup?.classList.remove('active');
});

// Обработка выбора времени
document.querySelectorAll('.time-slot').forEach(slot => {
  slot.addEventListener('click', () => {
    const time = slot.dataset.time;
    timeHidden.value = time;
    timePlaceholder.textContent = time;
    timePopup.classList.remove('active');
    // Убираем выделение у других
    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
    slot.classList.add('selected');
  });
});
// ===== Кастомные селекты: Мастер и Услуга =====
function initCustomSelect(triggerId, popupId, hiddenId, placeholderId, optionsClass) {
  const trigger = document.getElementById(triggerId);
  const popup = document.getElementById(popupId);
  const hidden = document.getElementById(hiddenId);
  const placeholder = document.getElementById(placeholderId);
  const options = document.querySelectorAll(`#${popupId} .select-option`);

  if (!trigger || !popup) return;

  // Открытие/закрытие
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = popup.classList.contains('active');
    // Закрываем другие поп-апы
    document.querySelectorAll('.select-popup, .calendar-popup, .time-popup').forEach(p => p.classList.remove('active'));
    if (!isActive) {
      popup.classList.add('active');
      trigger.classList.add('active');
    } else {
      popup.classList.remove('active');
      trigger.classList.remove('active');
    }
  });

  // Выбор опции
  options.forEach(opt => {
    opt.addEventListener('click', () => {
      const value = opt.dataset.value;
      const text = opt.textContent;
      hidden.value = value;
      placeholder.textContent = text;
      placeholder.style.color = 'var(--text)';
      popup.classList.remove('active');
      trigger.classList.remove('active');
      // Убираем выделение у всех и добавляем текущей
      options.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });

  // Если уже есть выбранное значение (например, при загрузке), подсветить
  if (hidden.value) {
    const selectedOption = Array.from(options).find(opt => opt.dataset.value === hidden.value);
    if (selectedOption) {
      placeholder.textContent = selectedOption.textContent;
      placeholder.style.color = 'var(--text)';
      selectedOption.classList.add('selected');
    }
  }
}

// Инициализация
initCustomSelect('customMasterInput', 'masterPopup', 'master', 'masterPlaceholder');
initCustomSelect('customServiceInput', 'servicePopup', 'service', 'servicePlaceholder');

// Обновим обработчики для закрытия поп-апов при клике вне
document.addEventListener('click', (e) => {
  // Мастер
  if (!document.getElementById('customMasterInput')?.contains(e.target) && !document.getElementById('masterPopup')?.contains(e.target)) {
    document.getElementById('masterPopup')?.classList.remove('active');
    document.getElementById('customMasterInput')?.classList.remove('active');
  }
  // Услуга
  if (!document.getElementById('customServiceInput')?.contains(e.target) && !document.getElementById('servicePopup')?.contains(e.target)) {
    document.getElementById('servicePopup')?.classList.remove('active');
    document.getElementById('customServiceInput')?.classList.remove('active');
  }
  // Календарь и время (уже есть, но можно объединить)
  // ... (код из предыдущей части остаётся)
});