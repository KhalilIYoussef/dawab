namespace Dawab.Application.Common.Interfaces;

public interface IFileStorageService
{
    Task<string> SaveFileAsync(Stream fileStream, string fileName, string folder);
    Task<bool> DeleteFileAsync(string relativePath);
}
