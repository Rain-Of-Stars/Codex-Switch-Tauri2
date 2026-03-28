pub mod commands;
pub mod errors;
pub mod models;
pub mod services;
pub mod state;
pub mod utils;

use commands::app_commands::{
    batch_test_profile_connections, delete_profile, duplicate_profile, execute_switch,
    get_switch_preview, list_backups, load_app_bootstrap, open_backup_directory,
    open_backups_directory, open_data_directory, open_logs_directory, pick_file_path,
    read_recent_logs, refresh_default_wsl, reset_template, restore_latest_backup, save_profile,
    save_template, set_profile_test_disabled, test_profile_connection, update_settings,
};
use state::app_state::AppState;
use tauri::Manager;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().build())
        .manage(AppState::new().expect("初始化应用状态失败"))
        .setup(|app| {
            if let (Some(window), Some(icon)) = (
                app.get_webview_window("main"),
                app.default_window_icon().cloned(),
            ) {
                window.set_icon(icon)?;
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            load_app_bootstrap,
            save_profile,
            delete_profile,
            duplicate_profile,
            update_settings,
            refresh_default_wsl,
            get_switch_preview,
            execute_switch,
            list_backups,
            restore_latest_backup,
            save_template,
            reset_template,
            test_profile_connection,
            batch_test_profile_connections,
            set_profile_test_disabled,
            read_recent_logs,
            open_data_directory,
            open_backups_directory,
            open_logs_directory,
            open_backup_directory,
            pick_file_path
        ])
        .run(tauri::generate_context!())
        .expect("运行 Tauri 应用失败");
}
