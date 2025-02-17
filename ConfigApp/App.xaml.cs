using Microsoft.Web.WebView2.Core;
using System.Configuration;
using System.Data;
using System.Diagnostics;
using System.Windows;

namespace APBSConfig
{
    /// <summary>
    /// Interaction logic for App.xaml
    /// </summary>
    public partial class App : Application
    {
        protected override void OnStartup(StartupEventArgs e)
        {
            CheckForWebView2Runtime();

            base.OnStartup(e);
            MainWindow mw = new MainWindow();
            mw.Show();
        }

        private void CheckForWebView2Runtime()
        {
            try
            {
                CoreWebView2Environment.GetAvailableBrowserVersionString();
            }

            catch
            {
                var messageBoxTitle = $"Missing Webview2 Runtime";
                var messageBoxMessage = $"You are missing the Evergreen Bootstrapper, which is required to use WebView2 applications. \n\n Please download and install the Evergreen Bootstrapper or Standalone Installer (if offline). \n\n https://developer.microsoft.com/en-us/microsoft-edge/webview2";
                var messageBoxButtons = MessageBoxButton.OKCancel;

                // Let the user decide if the app should die or not (if applicable).
                if (MessageBox.Show(messageBoxMessage, messageBoxTitle, messageBoxButtons) == MessageBoxResult.OK)
                {
                    Process.Start(new ProcessStartInfo { FileName = "https://developer.microsoft.com/en-us/microsoft-edge/webview2", UseShellExecute = true });
                }
                else
                {
                    Application.Current.Shutdown();
                }
            }
        }
    }

}
