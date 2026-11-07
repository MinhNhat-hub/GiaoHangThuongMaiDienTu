using NUnit.Framework;
using DateTimeChecker;

namespace DateTimeChecker.Tests
{

    [TestFixture]
    public class DaysInMonthTests
    {
        // Thứ tự tham số: DaysInMonth(year, month)

        [Test] public void UTCID01() => Assert.That(DateChecker.DaysInMonth(2024, 1), Is.EqualTo(31));
        [Test] public void UTCID02() => Assert.That(DateChecker.DaysInMonth(2024, 3), Is.EqualTo(31));
        [Test] public void UTCID03() => Assert.That(DateChecker.DaysInMonth(2024, 5), Is.EqualTo(31));
        [Test] public void UTCID04() => Assert.That(DateChecker.DaysInMonth(2024, 7), Is.EqualTo(31));
        [Test] public void UTCID05() => Assert.That(DateChecker.DaysInMonth(2024, 8), Is.EqualTo(31));

        [Test] public void UTCID06() => Assert.That(DateChecker.DaysInMonth(2024, 10), Is.EqualTo(31));
        [Test] public void UTCID07() => Assert.That(DateChecker.DaysInMonth(2024, 12), Is.EqualTo(31));
        [Test] public void UTCID08() => Assert.That(DateChecker.DaysInMonth(2024, 4), Is.EqualTo(30));
        [Test] public void UTCID09() => Assert.That(DateChecker.DaysInMonth(2024, 6), Is.EqualTo(30));
        [Test] public void UTCID10() => Assert.That(DateChecker.DaysInMonth(2000, 2), Is.EqualTo(29));

        [Test] public void UTCID11() => Assert.That(DateChecker.DaysInMonth(1900, 2), Is.EqualTo(28));
        [Test] public void UTCID12() => Assert.That(DateChecker.DaysInMonth(2024, 2), Is.EqualTo(29));
        [Test] public void UTCID13() => Assert.That(DateChecker.DaysInMonth(2023, 2), Is.EqualTo(28));
        [Test] public void UTCID14() => Assert.That(DateChecker.DaysInMonth(2024, 0), Is.EqualTo(0));
        [Test] public void UTCID15() => Assert.That(DateChecker.DaysInMonth(2024, 13), Is.EqualTo(0));

        [Test] public void UTCID16() => Assert.That(DateChecker.DaysInMonth(2024, 9), Is.EqualTo(30));
        [Test] public void UTCID17() => Assert.That(DateChecker.DaysInMonth(2024, 11), Is.EqualTo(30));
    }
}
