using NUnit.Framework;
using DateTimeChecker;

namespace DateTimeChecker.Tests
{
    [TestFixture]
    public class CheckDateTests
    {
        // Thứ tự tham số: CheckDate(year, month, day)

        [Test] public void UTCID01() => Assert.That(DateChecker.CheckDate(2024, 1, 15), Is.True);
        [Test] public void UTCID02() => Assert.That(DateChecker.CheckDate(2024, 1, 1), Is.True);
        [Test] public void UTCID03() => Assert.That(DateChecker.CheckDate(2024, 1, 31), Is.True);
        [Test] public void UTCID04() => Assert.That(DateChecker.CheckDate(2024, 1, 32), Is.False);
        [Test] public void UTCID05() => Assert.That(DateChecker.CheckDate(2024, 4, 30), Is.True);

        [Test] public void UTCID06() => Assert.That(DateChecker.CheckDate(2024, 4, 31), Is.False);
        [Test] public void UTCID07() => Assert.That(DateChecker.CheckDate(2023, 2, 28), Is.True);
        [Test] public void UTCID08() => Assert.That(DateChecker.CheckDate(2023, 2, 29), Is.False);
        [Test] public void UTCID09() => Assert.That(DateChecker.CheckDate(2024, 2, 29), Is.True);
        [Test] public void UTCID10() => Assert.That(DateChecker.CheckDate(2024, 2, 30), Is.False);


        [Test] public void UTCID11() => Assert.That(DateChecker.CheckDate(2000, 2, 29), Is.True);
        [Test] public void UTCID12() => Assert.That(DateChecker.CheckDate(1900, 2, 29), Is.False);
        [Test] public void UTCID13() => Assert.That(DateChecker.CheckDate(2024, 0, 15), Is.False);
        [Test] public void UTCID14() => Assert.That(DateChecker.CheckDate(2024, 13, 15), Is.False);
        [Test] public void UTCID15() => Assert.That(DateChecker.CheckDate(2024, 12, 0), Is.False);
    }
}
