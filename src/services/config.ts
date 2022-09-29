import { Disposable, workspace } from 'vscode';

export interface ConfigurationMonitor<T> extends Disposable {
    (): T;
}

export const getVsCodeConfig = <T>(key: string, defaultValue: T): T =>
    workspace.getConfiguration('md-log-utils').get<T>(key, defaultValue);

export const updateVsCodeConfig = <T>(key: string, value: T) =>
    workspace.getConfiguration().update('md-log-utils.' + key, value);

export const monitorVsCodeConfig = <T>(
    key: string,
    defaultValue: T
): ConfigurationMonitor<T> => {
    let value: T = getVsCodeConfig(key, defaultValue);
    const listener = workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('md-log-utils.' + key)) {
            value = getVsCodeConfig(key, defaultValue);
        }
    });
    const ret = () => {
        return value;
    };
    ret.dispose = () => listener.dispose();
    return ret;
};