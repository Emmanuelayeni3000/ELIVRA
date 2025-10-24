'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

interface DownloadInviteCardProps {
  cardElementId: string;
  inviteTitle: string;
}

const DownloadInviteCard: React.FC<DownloadInviteCardProps> = ({ 
  cardElementId, 
  inviteTitle 
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadAsImage = async () => {
    try {
      setIsDownloading(true);
      
      const element = document.getElementById(cardElementId);
      if (!element) {
        toast.error('Unable to find invitation card');
        return;
      }

      // Hide buttons before capturing
      const buttons = element.querySelectorAll('button, .download-exclude');
      buttons.forEach((btn) => {
        (btn as HTMLElement).style.display = 'none';
      });

      // Configure html2canvas options
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        height: element.scrollHeight,
        width: element.scrollWidth,
        scrollX: 0,
        scrollY: 0,
        ignoreElements: (element) => {
          // Skip elements that might cause color parsing issues
          return element.tagName === 'SCRIPT' || element.tagName === 'STYLE';
        },
        onclone: (clonedDoc) => {
          // Keep inline styles, but disable external styles that may inject oklab/oklch
          clonedDoc.querySelectorAll('link[rel="stylesheet"]').forEach((node) => node.remove());
          // Preserve inline <style> under the card if any, remove global ones
          clonedDoc.querySelectorAll('style').forEach((styleEl) => {
            // Remove style tags not inside the card subtree
            if (!styleEl.closest(`#${cardElementId}`)) styleEl.remove();
          });

          // Sanitize styles within the invitation card subtree only
          const clonedElement = clonedDoc.getElementById(cardElementId);
          if (!clonedElement) return;

          const nodes: HTMLElement[] = [clonedElement, ...Array.from(clonedElement.querySelectorAll<HTMLElement>('*'))];

          const colorProps = [
            'color', 'background-color', 'border-color',
            'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
            'box-shadow', 'text-shadow'
          ] as const;

          nodes.forEach((el) => {
            const computed = window.getComputedStyle(el);

            colorProps.forEach((prop) => {
              const val = computed.getPropertyValue(prop as unknown as string) || '';
              if (/oklab|oklch|\blch\(|\blab\(/i.test(val)) {
                // Apply safe theme fallbacks
                switch (prop) {
                  case 'color':
                    el.style.setProperty(prop, '#1D3557', 'important'); // royal-navy
                    break;
                  case 'background-color':
                    el.style.setProperty(prop, '#FFFFFF', 'important'); // white
                    break;
                  case 'border-color':
                  case 'border-top-color':
                  case 'border-right-color':
                  case 'border-bottom-color':
                  case 'border-left-color':
                    el.style.setProperty(prop, '#C9A368', 'important'); // gold-foil
                    break;
                  default:
                    el.style.setProperty(prop, 'none', 'important');
                }
              }
            });
          });

          // Add subtle export-only frame to beautify the download
          clonedElement.style.padding = '24px';
          clonedElement.style.background = '#FFFFFF';
          clonedElement.style.boxShadow = '0 12px 40px rgba(29, 53, 87, 0.15)';
          clonedElement.style.borderRadius = '12px';
          clonedElement.style.border = '1px solid rgba(201, 163, 104, 0.25)';
          clonedElement.style.display = 'flex';
          clonedElement.style.flexDirection = 'column';
          clonedElement.style.alignItems = 'center';
          clonedElement.style.justifyContent = 'center';
          clonedElement.style.textAlign = 'center';

          // Normalize any explicitly left-aligned text classes for export
          clonedElement.querySelectorAll<HTMLElement>('.text-left').forEach((el) => {
            el.classList.remove('text-left');
            el.style.textAlign = 'center';
          });
          clonedElement.querySelectorAll<HTMLElement>('.items-start').forEach((el) => {
            el.classList.remove('items-start');
            el.style.alignItems = 'center';
          });
          
          // Find and center the event details grid
          const eventDetailsGrid = clonedElement.querySelector('.grid');
          if (eventDetailsGrid) {
            (eventDetailsGrid as HTMLElement).style.textAlign = 'center';
            (eventDetailsGrid as HTMLElement).style.justifyItems = 'center';
            (eventDetailsGrid as HTMLElement).style.alignItems = 'center';
            
            // Center individual detail items
            const detailItems = eventDetailsGrid.querySelectorAll('.flex');
            detailItems.forEach((item) => {
              const detail = item as HTMLElement;
              detail.style.justifyContent = 'center';
              detail.style.textAlign = 'center';
              detail.style.flexDirection = 'column';
              detail.style.alignItems = 'center';
              
              // Center the text within each detail item
              const textDiv = item.querySelector('div:last-child');
              if (textDiv) {
                (textDiv as HTMLElement).style.textAlign = 'center';
                (textDiv as HTMLElement).style.marginTop = '8px';
              }
            });
          }

          // Ensure any buttons hidden for download remain excluded
          clonedElement.querySelectorAll('button').forEach((button) => {
            (button as HTMLElement).style.display = 'none';
          });
        },
      });

      // Restore buttons after capturing
      buttons.forEach((btn) => {
        (btn as HTMLElement).style.display = '';
      });

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${inviteTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_invitation.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          toast.success('Invitation card downloaded successfully!');
        } else {
          toast.error('Failed to generate download');
        }
      }, 'image/png');

    } catch (error) {
      console.error('Error downloading invitation:', error);
      toast.error('Failed to download invitation card');
      
      // Restore buttons in case of error
      const element = document.getElementById(cardElementId);
      if (element) {
        const buttons = element.querySelectorAll('button, .download-exclude');
        buttons.forEach((btn) => {
          (btn as HTMLElement).style.display = '';
        });
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      onClick={downloadAsImage}
      disabled={isDownloading}
      variant="outline"
      className="flex items-center gap-2 btn-outline-gold"
    >
      {isDownloading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-royal-navy"></div>
          Preparing...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Download Invite
        </>
      )}
    </Button>
  );
};

export default DownloadInviteCard;