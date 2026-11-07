namespace DateTimeChecker
{
    public class DateChecker
    {
        public static int DaysInMonth(int year, int month)
        {
            switch (month)
            {
                case 1:
                case 3:
                case 5:
                case 7:
                case 8:
                case 10:
                case 12:
                    return 31;
                case 4:
                case 6:
                case 9:
                case 11:
                    return 30;
                case 2:
                    if (year % 400 == 0) return 29;   // chia hết 400 -> nhuận
                    if (year % 100 == 0) return 28;   // chia hết 100 (không chia hết 400) -> không nhuận
                    if (year % 4 == 0) return 29;     // chia hết 4 -> nhuận
                    return 28;
                default:
                    return 0;                         // tháng không hợp lệ
            }
        }

        public static bool CheckDate(int year, int month, int day)
        {
            if (month < 1 || month > 12) return false;
            if (day < 1) return false;
            return day <= DaysInMonth(year, month);
        }
    }
}
