const make = (id, label, start) => ({ id, label, start, capacity: 10, enabled: true });

export function getInitialSlots() {
  return [
    make('slot-1030', '10:30 AM - 10:40 AM', '10:30'),
    make('slot-1040', '10:40 AM - 10:50 AM', '10:40'),
    make('slot-1050', '10:50 AM - 11:00 AM', '10:50'),
    make('slot-1100', '11:00 AM - 11:10 AM', '11:00'),
    make('slot-1230', '12:30 PM - 12:40 PM', '12:30'),
    make('slot-1240', '12:40 PM - 12:50 PM', '12:40'),
    make('slot-1250', '12:50 PM - 1:00 PM', '12:50'),
  ];
}
