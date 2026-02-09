/* Export all types from talent-calender feature */
export type TalentBook = {
  name: string;
  philosophyUrl: string;
  teachingUrl: string;
  guideUrl: string;
  dayOne: string;
  dayTwo: string;
  bookName: string;
};

export type TalentBookCalendar = {
  location: string;
  days: {
    day: string;
    books: {
      name: string;
      url: string;
    }[];
    characters: {
      name: string;
      url: string;
    }[];
  }[];
};
