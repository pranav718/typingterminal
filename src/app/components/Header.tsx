'use client';

interface HeaderProps {
  user: any;
  isGuest: boolean;
  logout: () => void;
  onSettingsClick: () => void;
  onSkipClick: () => void;
  onUploadClick: () => void;
  showUpload: boolean;
  isComplete: boolean;
  isLoadingBook: boolean;
}

export default function Header({
  user,
  isGuest,
  logout,
  onSettingsClick,
  onSkipClick,
  onUploadClick,
  showUpload,
  isComplete,
  isLoadingBook,
}: HeaderProps) {
  return (
    <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 p-4 md:p-5 bg-matrix-primary/5 border border-matrix-primary/20 rounded-xl backdrop-blur-sm">
      <h1 className="text-2xl md:text-3xl font-bold text-matrix-primary drop-shadow-glow-lg">
        TerminalType
      </h1>
      
      <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 w-full md:w-auto">
        {user && (
          <div className="flex items-center justify-between gap-3 px-3 py-2 bg-matrix-primary/10 rounded-md text-sm text-matrix-light w-full md:w-auto">
            <div className="flex items-center gap-2">
              {user.image && !isGuest && (
                <img 
                  src={user.image} 
                  alt={user.name || 'User'} 
                  className="w-6 h-6 rounded-full"
                />
              )}
              <span className="truncate">
                {isGuest ? 'Guest User' : (user.email || user.name)}
              </span>
              {isGuest && (
                <span className="px-2 py-0.5 bg-warning/20 text-warning text-xs rounded">
                  Guest
                </span>
              )}
            </div>
            <button
              onClick={logout}
              className="px-3 py-1 text-xs border-2 border-error text-error rounded hover:bg-error hover:text-matrix-bg transition-all min-h-[36px]"
            >
              Logout
            </button>
          </div>
        )}
        
        <button
          onClick={onSettingsClick}
          className="w-full md:w-auto px-4 py-2.5 border-2 border-cyan-500 text-cyan-500 rounded-md hover:bg-cyan-500 hover:text-matrix-bg transition-all font-semibold text-sm min-h-[44px] flex items-center justify-center gap-2"
        >
          ⚙️ Settings
        </button>
        
        {!isComplete && !showUpload && !isLoadingBook && (
          <button
            onClick={onSkipClick}
            className="w-full md:w-auto px-4 py-2.5 border-2 border-warning text-warning rounded-md hover:bg-warning hover:text-matrix-bg transition-all font-semibold text-sm min-h-[44px]"
          >
            Skip Passage
          </button>
        )}
        
        <button
          onClick={() => {
            if (isGuest && !showUpload) {
              alert('Please sign up or log in to upload books');
              return;
            }
            onUploadClick();
          }}
          className="w-full md:w-auto px-4 py-2.5 border-2 border-matrix-primary text-matrix-primary rounded-md hover:bg-matrix-primary hover:text-matrix-bg transition-all font-semibold text-sm min-h-[44px]"
        >
          {showUpload ? 'Close' : 'Upload Book PDF'}
        </button>
      </div>
    </header>
  );
}