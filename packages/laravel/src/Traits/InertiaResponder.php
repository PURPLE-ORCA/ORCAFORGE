<?php

namespace OrcaForge\Laravel\Traits;

use Illuminate\Http\RedirectResponse;

trait InertiaResponder
{
    /**
     * Redirect back with a strict success flash state.
     * Your React layout should listen for `page.props.flash.success`
     */
    protected function backWithSuccess(string $message = 'Action completed successfully.'): RedirectResponse
    {
        return back()->with('success', $message);
    }

    /**
     * Redirect back with a strict error flash state.
     * Your React layout should listen for `page.props.flash.error`
     */
    protected function backWithError(string $message = 'An error occurred.'): RedirectResponse
    {
        return back()->with('error', $message);
    }

    /**
     * Redirect to a specific route with a success message.
     * Perfect for standard CRUD store/update methods.
     */
    protected function redirectWithSuccess(string $route, string $message, array $parameters = []): RedirectResponse
    {
        return redirect()->route($route, $parameters)->with('success', $message);
    }

    /**
     * Redirect to a specific route with a warning or info message.
     */
    protected function redirectWithInfo(string $route, string $message, array $parameters = []): RedirectResponse
    {
        return redirect()->route($route, $parameters)->with('info', $message);
    }
}