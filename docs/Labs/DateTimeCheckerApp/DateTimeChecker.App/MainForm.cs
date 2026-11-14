using System;
using System.Drawing;
using System.IO;
using System.Windows.Forms;

namespace DateTimeChecker.App
{
    public partial class MainForm : Form
    {
        public MainForm()
        {
            InitializeComponent();
            LoadLogo();
        }

        // Loads Resources/logo.png into memory so the file is not locked; a missing or broken image leaves the box empty.
        private void LoadLogo()
        {
            string path = Path.Combine(AppContext.BaseDirectory, "Resources", "logo.png");
            if (!File.Exists(path))
            {
                return;
            }
            try
            {
                using (var stream = new MemoryStream(File.ReadAllBytes(path)))
                using (var image = Image.FromStream(stream))
                {
                    picLogo.Image = new Bitmap(image);
                }
            }
            catch (Exception)
            {
            }
        }

        private void btnClear_Click(object sender, EventArgs e)
        {
            txtDay.Clear();
            txtMonth.Clear();
            txtYear.Clear();
            txtDay.Focus();
        }

        private void btnCheck_Click(object sender, EventArgs e)
        {
            CheckResult r = InputValidator.Check(txtDay.Text, txtMonth.Text, txtYear.Text);
            MessageBoxIcon icon = (r.Status == CheckStatus.FormatError || r.Status == CheckStatus.RangeError)
                ? MessageBoxIcon.Error
                : MessageBoxIcon.Information;
            MessageBox.Show(r.Message, r.Title, MessageBoxButtons.OK, icon);
        }

        private void MainForm_FormClosing(object sender, FormClosingEventArgs e)
        {
            if (e.CloseReason != CloseReason.UserClosing)
            {
                return;
            }
            DialogResult answer = MessageBox.Show("Are you sure to exit?", "Confirm",
                MessageBoxButtons.YesNo, MessageBoxIcon.Information);
            if (answer == DialogResult.No)
            {
                e.Cancel = true;
            }
        }
    }
}
