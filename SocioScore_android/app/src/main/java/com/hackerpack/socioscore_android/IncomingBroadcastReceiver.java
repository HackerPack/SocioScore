package com.hackerpack.socioscore_android;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.telephony.TelephonyManager;
import android.util.Log;

/**
 * Created by bharathi_pc on 11/5/2016.
 */
public class IncomingBroadcastReceiver  extends BroadcastReceiver {
    Context context;
    @Override
    public void onReceive(final Context context, Intent intent) {

        Log.d("onReceive: ", "flag1");

        String state = intent.getStringExtra(TelephonyManager.EXTRA_STATE);
        Log.d("onReceive: ", state);
        if (state.equals(TelephonyManager.EXTRA_STATE_RINGING)
                || state.equals(TelephonyManager.EXTRA_STATE_OFFHOOK)) {

            Log.d("Ringing", "Phone is ringing");

            Intent i = new Intent(context, IncomingCallActivity.class);
            i.putExtras(intent);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            i.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
//            Wait.oneSec();
            context.startActivity(i);

        }
    }
}