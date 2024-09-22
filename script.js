// Get references to HTML elements
const calendar = document.getElementById('calendar');
const totalCostElement = document.getElementById('totalCost');
const modal = document.getElementById('subscriptionModal');
const closeModal = document.getElementById('closeModal');
const subscriptionForm = document.getElementById('subscriptionForm');
const subscriptionDateInput = document.getElementById('subscriptionDate');
const subscriptionNameSelect = document.getElementById('subscriptionName');
const customSubscriptionNameInput = document.getElementById('customSubscriptionName');
const subscriptionCostInput = document.getElementById('subscriptionCost');
const subscriptionStartDateInput = document.getElementById('subscriptionStartDate');
const modalDate = document.getElementById('modalDate');
const subscriptionsList = document.getElementById('subscriptionsList');
const monthAndYear = document.getElementById('monthAndYear');
const prevMonthButton = document.getElementById('prevMonth');
const nextMonthButton = document.getElementById('nextMonth');
const formTitle = document.getElementById('formTitle');
const formSubmitButton = document.getElementById('formSubmitButton');
const editSubscriptionNameInput = document.getElementById('editSubscriptionName');

const clearDataButton = document.getElementById('clearDataButton');
const hoverTooltip = document.getElementById('hoverTooltip');

let totalCost = 0;
let subscriptions = []; // Array of subscription objects

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

let isEditing = false;

// Subscription logos
const subscriptionLogos = {
  'Spotify': 'spotify-logo.png',
  'Netflix': 'netflix-logo.png',
  'Apple One': 'appleone-logo.png',
  'ChatGPT Plus': 'chatgpt-logo.png',
  'Figma': 'figma-logo.png',
  'X Premium': 'x-premium-logo.png',
  'Youtube Premium': 'youtube-premium-logo.png',
  'Canva': 'canva-logo.png',
  'Google One': 'google-one-logo.png',
  // Add paths to other logos as needed
};

// Function to get the date in YYYY-MM-DD format using local timezone
function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() +1).padStart(2,'0');
  const day = String(date.getDate()).padStart(2,'0');
  return `${year}-${month}-${day}`;
}

// Function to strip time components from a date
function getDateWithoutTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Variable to track the current date for real-time updates
let currentDate = getLocalDateString(new Date());

// Load subscriptions from localStorage on page load
function loadData() {
  const storedSubscriptions = localStorage.getItem('subscriptions');

  if (storedSubscriptions) {
    subscriptions = JSON.parse(storedSubscriptions);
    // Convert startDate strings back to Date objects
    subscriptions.forEach(sub => {
      sub.startDate = new Date(sub.startDate);
      sub.day = parseInt(sub.day); // Ensure day is a number
    });
  } else {
    subscriptions = [];
  }

  updateTotalCost();
}

// Save subscriptions to localStorage
function saveData() {
  // Convert Date objects to ISO strings before saving
  const subscriptionsToStore = subscriptions.map(sub => ({
    ...sub,
    startDate: sub.startDate.toISOString(),
  }));
  localStorage.setItem('subscriptions', JSON.stringify(subscriptionsToStore));
}

// Generate the calendar for a given month and year
function generateCalendar(month, year) {
  calendar.innerHTML = '';

  // Display month and year
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  monthAndYear.textContent = `${monthNames[month]} ${year}`;

  // Get the first day of the month
  const firstDay = new Date(year, month, 1).getDay();

  // Get the number of days in the month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create blank days for the previous month
  for (let i = 0; i < firstDay; i++) {
    const blankDay = document.createElement('div');
    blankDay.classList.add('day', 'blank');
    calendar.appendChild(blankDay);
  }

  // Create days for the current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateString = getLocalDateString(date);

    const dayElement = document.createElement('div');
    dayElement.classList.add('day');
    dayElement.dataset.date = dateString;
    dayElement.dataset.day = day.toString();

    // Highlight the current date
    if (dateString === currentDate) {
      dayElement.classList.add('today');
    }

    // Date number
    const dateNumber = document.createElement('div');
    dateNumber.classList.add('date-number');
    dateNumber.textContent = day;
    dayElement.appendChild(dateNumber);

    // Subscriptions on this day
    const subs = subscriptions.filter(sub => {
      return sub.day === day && getDateWithoutTime(sub.startDate) <= getDateWithoutTime(date);
    });

    if (subs.length > 0) {
      const logoContainer = document.createElement('div');
      logoContainer.classList.add('subscription-logo');

      // Display all subscription logos
      subs.forEach(subscription => {
        const subscriptionName = subscription.name;
        const logoPath = subscriptionLogos[subscriptionName];

        if (logoPath) {
          const logoImg = document.createElement('img');
          logoImg.src = logoPath;
          logoImg.alt = subscriptionName;

          // Error handling for missing images
          logoImg.onerror = function() {
            const initials = subscriptionName.charAt(0).toUpperCase();
            const textSpan = document.createElement('span');
            textSpan.textContent = initials;
            logoContainer.appendChild(textSpan);
            logoImg.remove();
          };

          logoContainer.appendChild(logoImg);
        } else {
          // If no logo, display the name initials
          const initials = subscriptionName.charAt(0).toUpperCase();
          const textSpan = document.createElement('span');
          textSpan.textContent = initials;
          logoContainer.appendChild(textSpan);
        }
      });

      dayElement.appendChild(logoContainer);
    }

    // Attach hover event
    dayElement.addEventListener('mouseenter', (event) => showTooltip(event, dayElement, date));
    dayElement.addEventListener('mouseleave', hideTooltip);

    dayElement.addEventListener('click', openModalForDate);

    calendar.appendChild(dayElement);
  }

  // Activate the calendar with animation
  setTimeout(() => {
    calendar.classList.add('active');
  }, 50);
}


    // Show tooltip on hover
    function showTooltip(event, dayElement, date) {
      const day = parseInt(dayElement.dataset.day);
      const dateObj = date;

      const subs = subscriptions.filter(sub => {
        return sub.day === day && getDateWithoutTime(sub.startDate) <= getDateWithoutTime(dateObj);
      });

      if (subs.length === 0) return;

      // Clear previous content
      hoverTooltip.innerHTML = '';

      subs.forEach(subscription => {
        const subscriptionName = subscription.name;

        const tooltipContent = document.createElement('div');
        tooltipContent.classList.add('hover-section');

        // Logo and "Every month on the xth"
        const logoPath = subscriptionLogos[subscriptionName];
        if (logoPath) {
          const logoImgHover = document.createElement('img');
          logoImgHover.src = logoPath;
          logoImgHover.alt = subscriptionName;
          tooltipContent.appendChild(logoImgHover);
        } else {
          // Display subscription name if no logo
          const nameDiv = document.createElement('div');
          nameDiv.textContent = subscriptionName;
          tooltipContent.appendChild(nameDiv);
        }

        const everyMonthText = document.createElement('div');
        everyMonthText.textContent = `Every month on the ${day}${getOrdinalSuffix(day)}`;

        // Cost
        const costText = document.createElement('div');
        costText.textContent = `Cost: Rp ${formatRupiah(subscription.cost)}`;

        // "Total since MM/YY"
        const totalSinceText = document.createElement('div');
        totalSinceText.textContent = `Total since ${formatDateToMonthYear(subscription.startDate)}`;

        // Total cost since beginning
        const totalMonths = getTotalMonths(subscription.startDate, new Date());
        const totalCostSubscription = subscription.cost * totalMonths;
        const totalCostText = document.createElement('div');
        totalCostText.textContent = `Total Paid: Rp ${formatRupiah(totalCostSubscription)}`;

        // Append elements
        tooltipContent.appendChild(everyMonthText);
        tooltipContent.appendChild(costText);
        tooltipContent.appendChild(totalSinceText);
        tooltipContent.appendChild(totalCostText);

        hoverTooltip.appendChild(tooltipContent);
      });

      // Position the tooltip
      const rect = dayElement.getBoundingClientRect();
      const tooltipWidth = 250; // Adjusted width

      let left = rect.right + 10;
      if (window.innerWidth - rect.right < tooltipWidth + 20) {
        left = rect.left - tooltipWidth - 10;
        hoverTooltip.style.left = `${left}px`;
        hoverTooltip.style.top = `${rect.top + window.scrollY}px`;
        hoverTooltip.style.display = 'block';
        hoverTooltip.style.transformOrigin = 'right center';
      } else {
        hoverTooltip.style.left = `${left}px`;
        hoverTooltip.style.top = `${rect.top + window.scrollY}px`;
        hoverTooltip.style.display = 'block';
        hoverTooltip.style.transformOrigin = 'left center';
      }
    }

    // Hide tooltip
    function hideTooltip() {
      hoverTooltip.style.display = 'none';
    }

    // Get ordinal suffix for date
    function getOrdinalSuffix(day) {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1:  return 'st';
        case 2:  return 'nd';
        case 3:  return 'rd';
        default: return 'th';
      }
    }

    // Open modal for a date
    function openModalForDate(event) {
      const dateString = event.currentTarget.dataset.date;
      const dateObj = new Date(dateString);
      const day = dateObj.getDate();

      subscriptionDateInput.value = day;
      modalDate.textContent = `Every ${day}${getOrdinalSuffix(day)} of the Month`;
      modal.style.display = 'block';
      displaySubscriptionsInModal(day);
      subscriptionForm.reset();
      customSubscriptionNameInput.value = '';
      document.getElementById('customSubscriptionNameContainer').style.display = 'none';
      isEditing = false;
      formTitle.textContent = 'Add Subscription';
      formSubmitButton.textContent = 'Add Subscription';
      editSubscriptionNameInput.value = '';

      // Set default start date to the date clicked
      subscriptionStartDateInput.value = dateString;
    }

    // Display subscriptions in modal
    function displaySubscriptionsInModal(day) {
      subscriptionsList.innerHTML = '';
      day = parseInt(day); // Ensure day is a number
      const subs = subscriptions.filter(sub => sub.day === day);

      if (subs.length > 0) {
        subs.forEach(subscription => {
          const subscriptionName = subscription.name;
          const item = document.createElement('div');
          item.classList.add('subscription-item-modal');

          const detailsContainer = document.createElement('div');
          detailsContainer.style.display = 'flex';
          detailsContainer.style.alignItems = 'center';

          const logoPath = subscriptionLogos[subscriptionName];
          if (logoPath) {
            const logoImg = document.createElement('img');
            logoImg.src = logoPath;
            logoImg.alt = subscriptionName;

            // Error handling for missing images
            logoImg.onerror = function() {
              const initials = subscriptionName.charAt(0).toUpperCase();
              const textSpan = document.createElement('span');
              textSpan.textContent = initials;
              textSpan.style.fontSize = '1.2em';
              textSpan.style.fontWeight = 'bold';
              detailsContainer.appendChild(textSpan);
              logoImg.remove();
            };

            detailsContainer.appendChild(logoImg);
          } else {
            const initials = subscriptionName.charAt(0).toUpperCase();
            const textSpan = document.createElement('span');
            textSpan.textContent = initials;
            textSpan.style.fontSize = '1.2em';
            textSpan.style.fontWeight = 'bold';
            detailsContainer.appendChild(textSpan);
          }

          const details = document.createElement('div');
          details.classList.add('subscription-details');
          details.textContent = `${subscriptionName}: Rp ${formatRupiah(subscription.cost)}`;
          detailsContainer.appendChild(details);

          const actions = document.createElement('div');
          actions.classList.add('subscription-actions');

          const editBtn = document.createElement('button');
          editBtn.innerHTML = 'Edit';
          editBtn.addEventListener('click', () => {
            openEditSubscription(subscription);
          });

          const deleteBtn = document.createElement('button');
          deleteBtn.innerHTML = 'Delete';
          deleteBtn.addEventListener('click', () => {
            deleteSubscription(subscription);
          });

          actions.appendChild(editBtn);
          actions.appendChild(deleteBtn);

          item.appendChild(detailsContainer);
          item.appendChild(actions);

          subscriptionsList.appendChild(item);
        });
      } else {
        const noSubs = document.createElement('div');
        noSubs.textContent = 'No subscriptions on this date.';
        subscriptionsList.appendChild(noSubs);
      }
    }

    // Open edit subscription mode
    function openEditSubscription(subscription) {
      isEditing = true;
      formTitle.textContent = 'Edit Subscription';
      formSubmitButton.textContent = 'Update Subscription';
      editSubscriptionNameInput.value = subscription.name;

      subscriptionDateInput.value = subscription.day;
      subscriptionNameSelect.value = subscription.name;
      subscriptionCostInput.value = subscription.cost;
      subscriptionStartDateInput.value = getLocalDateString(subscription.startDate);

      if (!Array.from(subscriptionNameSelect.options).some(option => option.value === subscription.name)) {
        // If the subscription name is custom and not in the select options
        subscriptionNameSelect.value = 'Else';
        document.getElementById('customSubscriptionNameContainer').style.display = 'block';
        customSubscriptionNameInput.value = subscription.name;
      } else {
        document.getElementById('customSubscriptionNameContainer').style.display = 'none';
        customSubscriptionNameInput.value = '';
      }
    }

    // Close the modal
    closeModal.addEventListener('click', () => {
      modal.style.display = 'none';
      isEditing = false;
      editSubscriptionNameInput.value = '';
      formTitle.textContent = 'Add Subscription';
      formSubmitButton.textContent = 'Add Subscription';
    });

    window.addEventListener('click', (event) => {
      if (event.target == modal) {
        modal.style.display = 'none';
        isEditing = false;
        editSubscriptionNameInput.value = '';
        formTitle.textContent = 'Add Subscription';
        formSubmitButton.textContent = 'Add Subscription';
      }
    });

    // Handle form submission
    subscriptionForm.addEventListener('submit', function (event) {
      event.preventDefault();

      let name = subscriptionNameSelect.value;
      if (name === 'Else') {
        name = customSubscriptionNameInput.value.trim();
        if (name === '') {
          alert('Please enter a subscription name.');
          return;
        }
      }

      const cost = parseInt(subscriptionCostInput.value);
      const day = parseInt(subscriptionDateInput.value);
      const startDateValue = subscriptionStartDateInput.value;
      const startDate = new Date(startDateValue);
      const originalName = editSubscriptionNameInput.value;

      if (name === '' || isNaN(cost) || isNaN(day) || !startDateValue) {
        alert('Please enter valid subscription details.');
        return;
      }

      if (isEditing) {
        // Edit existing subscription
        const index = subscriptions.findIndex(sub => sub.name === originalName && sub.day === day);
        if (index !== -1) {
          subscriptions[index] = { name, cost, day, startDate };
          isEditing = false;
          editSubscriptionNameInput.value = '';
          formTitle.textContent = 'Add Subscription';
          formSubmitButton.textContent = 'Add Subscription';
        }
      } else {
        // Check for duplicate subscription
        if (subscriptions.some(sub => sub.name === name && sub.day === day)) {
          alert('This subscription already exists on this date.');
          return;
        }
        subscriptions.push({ name, cost, day, startDate });
      }

      updateTotalCost();
      generateCalendar(currentMonth, currentYear);

      saveData(); // Save data to localStorage

      // Reset form
      subscriptionForm.reset();
      customSubscriptionNameInput.value = '';
      document.getElementById('customSubscriptionNameContainer').style.display = 'none';
      displaySubscriptionsInModal(day);
    });

    // Delete subscription
    function deleteSubscription(subscription) {
      subscriptions = subscriptions.filter(sub => sub !== subscription);

      updateTotalCost();
      generateCalendar(currentMonth, currentYear);

      saveData(); // Save data to localStorage
      displaySubscriptionsInModal(subscription.day);
    }

    // Update total cost
    function updateTotalCost() {
      totalCost = 0;
      const today = new Date();

      subscriptions.forEach(sub => {
        if (getDateWithoutTime(sub.startDate) <= getDateWithoutTime(today)) {
          totalCost += sub.cost;
        }
      });

      totalCostElement.textContent = formatRupiah(totalCost);
    }

    // Format number as Rupiah currency
    function formatRupiah(amount) {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
        .format(amount)
        .replace('Rp', '')
        .trim();
    }

    // Get total months between two dates
    function getTotalMonths(startDate, endDate) {
      if (!startDate || !endDate) return 0;
      let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
      months -= startDate.getMonth();
      months += endDate.getMonth();
      // Adjust if endDate's day is before startDate's day
      if (endDate.getDate() < startDate.getDate()) {
        months--;
      }
      return months + 1; // Include start month
    }

    // Format date to MM/YY
    function formatDateToMonthYear(date) {
      if (!date) return '';
      const month = date.getMonth() + 1;
      const year = date.getFullYear() % 100;
      return `${month.toString().padStart(2, '0')}/${year.toString().padStart(2, '0')}`;
    }

    // Handle month navigation
    prevMonthButton.addEventListener('click', () => {
      calendar.classList.remove('active');
      setTimeout(() => {
        currentMonth--;
        if (currentMonth < 0) {
          currentYear--;
          currentMonth = 11;
        }
        generateCalendar(currentMonth, currentYear);
      }, 200);
    });

    nextMonthButton.addEventListener('click', () => {
      calendar.classList.remove('active');
      setTimeout(() => {
        currentMonth++;
        if (currentMonth > 11) {
          currentYear++;
          currentMonth = 0;
        }
        generateCalendar(currentMonth, currentYear);
      }, 200);
    });

    // Clear all data
    clearDataButton.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all data?')) {
        subscriptions = [];
        totalCost = 0;
        localStorage.removeItem('subscriptions');
        totalCostElement.textContent = formatRupiah(totalCost);
        generateCalendar(currentMonth, currentYear);
      }
    });

    // Subscription Name Change Handler
    subscriptionNameSelect.addEventListener('change', function () {
      if (this.value === 'Else') {
        document.getElementById('customSubscriptionNameContainer').style.display = 'block';
      } else {
        document.getElementById('customSubscriptionNameContainer').style.display = 'none';
      }
    });

    // Function to check date change
    function checkDateChange() {
      const today = getLocalDateString(new Date());
      if (currentDate !== today) {
        currentDate = today;
        generateCalendar(currentMonth, currentYear);
      }
    }

    // Check for date change every minute
    setInterval(checkDateChange, 60000);

    // Load data and initialize the calendar
    loadData();
    generateCalendar(currentMonth, currentYear);
