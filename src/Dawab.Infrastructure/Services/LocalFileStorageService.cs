using Dawab.Application.Common.Interfaces;

namespace Dawab.Infrastructure.Services;

public class LocalFileStorageService : IFileStorageService
{
    private readonly string _baseUploadsPath;

    public LocalFileStorageService()
    {
        _baseUploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        if (!Directory.Exists(_baseUploadsPath))
        {
            Directory.CreateDirectory(_baseUploadsPath);
        }
    }

    public async Task<string> SaveFileAsync(Stream fileStream, string fileName, string folder)
    {
        var targetFolder = Path.Combine(_baseUploadsPath, folder);
        if (!Directory.Exists(targetFolder))
        {
            Directory.CreateDirectory(targetFolder);
        }

        var uniqueFileName = $"{Guid.NewGuid():N}_{Path.GetFileName(fileName)}";
        var fullPath = Path.Combine(targetFolder, uniqueFileName);

        using (var outputStream = new FileStream(fullPath, FileMode.Create))
        {
            await fileStream.CopyToAsync(outputStream);
        }

        return $"/uploads/{folder}/{uniqueFileName}";
    }

    public Task<bool> DeleteFileAsync(string relativePath)
    {
        try
        {
            var cleanedPath = relativePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
            var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", cleanedPath);

            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                return Task.FromResult(true);
            }
            return Task.FromResult(false);
        }
        catch
        {
            return Task.FromResult(false);
        }
    }
}
