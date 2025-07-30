<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CheckerNotification extends Notification implements ShouldQueue
{
    use Queueable;
    /**
     * @var mixed $checkerData
     */
    public $checkerData;
    /**
     * Create a new notification instance.
     *@param mixed $checkerData
     * @return void
     */
    public function __construct($checkerData)
    {
        $this->checkerData = $checkerData;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject($this->checkerData['subject'])
            ->line($this->checkerData['body']);
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [
            'form_id' => $this->checkerData['form_id'],
            'body' => $this->checkerData['body'],
            'url' => $this->checkerData['url']
        ];
    }
}
